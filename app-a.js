// Password protection — local preview skips the gate so the calendar is usable here.
        (function() {
            const correctPassword = 'NLCAM';
            const sessionKey = 'calendarAuthenticated';
            const localHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(location.hostname);
            const gate = document.getElementById('passwordGate');
            const app = document.getElementById('appContainer');

            function showApp() {
                if (gate) {
                    gate.hidden = true;
                    gate.style.display = 'none';
                }
                if (app) {
                    app.hidden = false;
                    app.style.display = '';
                }
            }

            if (localHost || localStorage.getItem(sessionKey) === 'true') {
                showApp();
                return;
            }

            if (gate) gate.hidden = false;
            const form = document.getElementById('passwordForm');
            const input = document.getElementById('passwordInput');
            const error = document.getElementById('passwordError');
            if (form && input) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    if (input.value === correctPassword) {
                        localStorage.setItem(sessionKey, 'true');
                        showApp();
                    } else if (error) {
                        error.hidden = false;
                        input.focus();
                    }
                });
            }
        })();

        /* CALENDAR_EVENTS loaded from events.js */


        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9Aoj_XCkUPdp_4YOjDuybqRfLBI9dhY7oiU9c-LzVmWKS6RtyFjkaanOlPR7pJVtlag/exec';

        let events = [...CALENDAR_EVENTS];
        let currentView = 'year';
        const _now = new Date();
        let currentYear = _now.getFullYear();
        let currentMonth = _now.getMonth(); // 0-based; land on today
        let currentWeekStart = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate());
        {
            const dow = currentWeekStart.getDay();
            currentWeekStart.setDate(currentWeekStart.getDate() + (dow === 0 ? -6 : 1 - dow));
        }
        let hiddenTypes = {}; // legend toggles: true = hide that type (EV events, social, etc.)

        // ═════════════════════════════════════════════════════════════
        // OFFICE DAYS CONFIGURATION — Edit this section to change office days
        // ═════════════════════════════════════════════════════════════
        //
        // officeDaysOfWeek : which weekdays are office days
        //   0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday,
        //   4 = Thursday, 5 = Friday, 6 = Saturday
        //
        // excludeDates : specific dates to SKIP (e.g. holidays, bridges)
        //
        // extraDates : one-off dates to ADD (e.g. a moved office day)
        //
        // All changes are saved to localStorage so they persist.
        // ═════════════════════════════════════════════════════════════

        const DEFAULT_OFFICE_CONFIG = {
            officeDaysOfWeek: [3],             // Wednesday
            excludeDates: [
                '2026-06-24',  // Skip Wed (custom)
            ],
            extraDates: [
                '2026-05-01',  // Fri - Altug first day
                '2026-05-05',  // Tue - Marcel request
                '2026-06-26',  // Fri - custom extra day
            ]
        };

        function loadOfficeConfig() {
            const saved = localStorage.getItem('officeConfig');
            if (saved) {
                try { return JSON.parse(saved); } catch(e) { /* fall through */ }
            }
            return { ...DEFAULT_OFFICE_CONFIG };
        }
        function saveOfficeConfig(cfg) {
            localStorage.setItem('officeConfig', JSON.stringify(cfg));
        }

        let officeConfig = loadOfficeConfig();

        // ═════════════════════════════════════════════════════════════
        // MR GREEN OFFICE — who is expected at the Amsterdam office
        // Edit OFFICE_SCHEDULE for the defaults. The Holiday view can change
        // weekdays from today onward; those changes are saved with team events.
        // This is separate from the Wednesday "Office days" config above.
        //
        // person       : name shown on the Holiday view
        // weekdays     : 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
        // startDate    : inclusive YYYY-MM-DD. No office day is shown before it.
        // expectedDays : optional, shown read-only as "expected office days".
        //                Omit it when no number was given — do not invent one.
        // Weekday changes made in the Holiday view are saved separately.
        // They apply from the day they are saved; earlier days keep these defaults.
        // ═════════════════════════════════════════════════════════════
        const OFFICE_SCHEDULE = [
            { person: 'Derek',   weekdays: [1, 3, 4], startDate: '2026-12-01' },
            { person: 'Altug',   weekdays: [1, 3, 4], startDate: '2026-12-01' },
            { person: 'Marcel',  weekdays: [1, 4],    startDate: '2026-12-01', expectedDays: 7 },
            { person: 'Martina', weekdays: [1, 3, 4], startDate: '2026-12-01', expectedDays: 8 },
            { person: 'Irene',   weekdays: [1, 3],    startDate: '2026-12-01', expectedDays: 7 },
            { person: 'Arya',    weekdays: [1, 3],    startDate: '2026-12-01', expectedDays: 9 }
        ];

        // Holiday-view only. Not persisted, so it cannot touch officeConfig.
        let showMrGreenOffice = true;

        function toggleMrGreenOffice() {
            showMrGreenOffice = !showMrGreenOffice;
            if (typeof renderCalendar === 'function' && currentView === 'holidays') {
                renderCalendar();
            }
        }

        const MR_GREEN_WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        function mrGreenEscape(value) {
            return String(value == null ? '' : value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function mrGreenAttr(value) {
            return mrGreenEscape(value).replace(/\n/g, '&#10;');
        }

        function mrGreenNameMatches(person, text) {
            if (!text) return false;
            const escaped = String(person).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp('\\b' + escaped + '\\b', 'i').test(String(text));
        }

        function mrGreenEachDate(start, end, visit) {
            const startStr = String(start || '').slice(0, 10);
            const endStr = String(end || start || '').slice(0, 10);
            const first = new Date(startStr + 'T00:00:00');
            const last = new Date(endStr + 'T00:00:00');
            if (isNaN(first.getTime()) || isNaN(last.getTime())) return;
            for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                visit(`${y}-${m}-${day}`);
            }
        }

        // Netherlands public holidays in events.js have no location
        // (or location NL / Netherlands). China, Singapore, and Belgium
        // set location, so they do not clear the Amsterdam office.
        function isNetherlandsPublicHoliday(event) {
            if (!event || event.type !== 'holiday') return false;
            const loc = String(event.location || '').trim().toLowerCase();
            return loc === '' || loc === 'nl' || loc === 'netherlands' || loc === 'the netherlands';
        }

        // Employee holidays and WFH abroad store the person in the title,
        // which is how the holiday tables already match a name.
        // There is no separate out-of-office type. "other" events are work
        // (the who field lists people attending), so they are not absences.
        function mrGreenAbsenceReason(person, event) {
            if (!event || (event.type !== 'employee-holiday' && event.type !== 'wfh')) return null;
            if (!mrGreenNameMatches(person, event.title)) return null;
            return event.type === 'wfh' ? 'WFH abroad' : 'holiday';
        }

        function mrGreenWeekdayLabel(weekdays) {
            return (weekdays || []).map(d => MR_GREEN_WEEKDAY_NAMES[d] || '').filter(Boolean).join(', ');
        }

        function mrGreenExpectedLabel(row) {
            if (!row || row.expectedDays == null || row.expectedDays === '') return '';
            return 'expected office days: ' + row.expectedDays;
        }

        // Weekday overrides made in the Holiday view.
        // Saved like other team events (type mrgreen-weekdays): Google Sheet,
        // with the same localStorage cache. Calendar grids skip this type.
        // notes: "1,3|2026-11-19" means those weekdays from that date onward.
        // Days before the date keep the OFFICE_SCHEDULE weekdays.
        const MR_GREEN_WEEKDAY_DOW = [1, 2, 3, 4, 5];
        const mrGreenWeekdayPending = new Map();
        let mrGreenWeekdayPump = null;

        function mrGreenToday() {
            const d = new Date();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return d.getFullYear() + '-' + m + '-' + day;
        }

        function mrGreenWeekdayId(person) {
            return 'mrgreen-weekdays_custom_' + person;
        }

        function mrGreenScheduleRow(person) {
            return OFFICE_SCHEDULE.find(function (item) { return item.person === person; }) || null;
        }

        function mrGreenSameDays(a, b) {
            const left = (a || []).slice().sort(function (x, y) { return x - y; }).join(',');
            const right = (b || []).slice().sort(function (x, y) { return x - y; }).join(',');
            return left === right;
        }

        function parseWeekdayOverride(notes) {
            const text = String(notes == null ? '' : notes).trim();
            const parts = text.split('|');
            if (parts.length !== 2) return null;
            const from = parts[1].trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) return null;
            if (parts[0].trim() === '') return { weekdays: [], from: from };
            const days = parts[0].split(',').map(function (part) { return Number(part.trim()); });
            if (days.some(function (n) { return !Number.isInteger(n) || n < 1 || n > 5; })) return null;
            const unique = days.filter(function (n, i) { return days.indexOf(n) === i; })
                .sort(function (x, y) { return x - y; });
            return { weekdays: unique, from: from };
        }

        function mrGreenWeekdayOverride(person) {
            const id = mrGreenWeekdayId(person);
            const rows = events.filter(function (ev) {
                return ev && ev.id === id && String(ev.type || '').trim() === 'mrgreen-weekdays';
            });
            if (!rows.length) return null;
            return parseWeekdayOverride(rows[rows.length - 1].notes);
        }

        // Weekdays that apply on a calendar date. Before the saved date, the default.
        function mrGreenWeekdaysOn(person, dateStr) {
            const row = mrGreenScheduleRow(person);
            const base = row && row.weekdays ? row.weekdays : [];
            const override = mrGreenWeekdayOverride(person);
            if (override && dateStr >= override.from) return override.weekdays;
            return base;
        }

        // The chips edit the forward pattern: the override when one is saved, else the default.
        function mrGreenLegendWeekdays(person) {
            const override = mrGreenWeekdayOverride(person);
            if (override) return override.weekdays.slice();
            const row = mrGreenScheduleRow(person);
            return row && row.weekdays ? row.weekdays.slice() : [];
        }

        function encodeWeekdayNotes(weekdays, from) {
            return weekdays.slice().sort(function (a, b) { return a - b; }).join(',') + '|' + from;
        }

        async function deleteMrGreenSheetCopies(id) {
            for (let i = 0; i < 5; i++) {
                try {
                    const res = await fetch(APPS_SCRIPT_URL + '?action=delete&id=' + encodeURIComponent(id));
                    const data = await res.json().catch(function () { return null; });
                    if (!data || data.success === false) return;
                } catch (err) {
                    console.error('Failed to delete Mr Green weekdays', err);
                    return;
                }
            }
        }

        function drainMrGreenWeekdays() {
            const step = async function () {
                while (mrGreenWeekdayPending.size) {
                    const id = mrGreenWeekdayPending.keys().next().value;
                    const record = mrGreenWeekdayPending.get(id);
                    mrGreenWeekdayPending.delete(id);
                    await deleteMrGreenSheetCopies(id);
                    if (mrGreenWeekdayPending.has(id)) continue;
                    if (record) await saveEventToSheet(record);
                }
            };
            mrGreenWeekdayPump = step().catch(function (err) {
                console.error('Failed to save Mr Green weekdays', err);
            }).then(function () {
                mrGreenWeekdayPump = null;
                if (mrGreenWeekdayPending.size) drainMrGreenWeekdays();
            });
        }

        function writeMrGreenWeekdays(person, stored) {
            const id = mrGreenWeekdayId(person);
            events = events.filter(function (ev) { return ev.id !== id; });
            let record = null;
            if (stored) {
                record = {
                    id: id,
                    title: person,
                    start: stored.from,
                    end: stored.from,
                    type: 'mrgreen-weekdays',
                    notes: encodeWeekdayNotes(stored.weekdays, stored.from)
                };
                events.push(record);
            }
            saveBirthdays();
            mrGreenWeekdayPending.set(id, record);
            if (!mrGreenWeekdayPump) drainMrGreenWeekdays();
        }

        function toggleMrGreenWeekday(person, dow) {
            const row = mrGreenScheduleRow(person);
            if (!row || MR_GREEN_WEEKDAY_DOW.indexOf(dow) === -1) return;
            const current = mrGreenLegendWeekdays(person);
            const next = current.indexOf(dow) === -1
                ? current.concat([dow]).sort(function (a, b) { return a - b; })
                : current.filter(function (day) { return day !== dow; });
            if (mrGreenSameDays(next, row.weekdays)) writeMrGreenWeekdays(person, null);
            else writeMrGreenWeekdays(person, { weekdays: next, from: mrGreenToday() });
            if (typeof renderCalendar === 'function' && currentView === 'holidays') renderCalendar();
        }

        function resetMrGreenWeekdays(person) {
            if (!mrGreenWeekdayOverride(person)) return;
            writeMrGreenWeekdays(person, null);
            if (typeof renderCalendar === 'function' && currentView === 'holidays') renderCalendar();
        }

        // Weekday rows for one calendar year, from each person's startDate.
        // Computed when the Holiday view renders — not stored as events.
        function mrGreenDaysForYear(year) {
            const yearStr = String(year);
            const nlByDate = new Map();
            events.forEach(ev => {
                if (!isNetherlandsPublicHoliday(ev)) return;
                mrGreenEachDate(ev.start, ev.end, dateStr => {
                    if (dateStr.startsWith(yearStr) && !nlByDate.has(dateStr)) {
                        nlByDate.set(dateStr, ev.title || 'Public holiday');
                    }
                });
            });

            const away = new Map();
            OFFICE_SCHEDULE.forEach(row => away.set(row.person, new Map()));
            events.forEach(ev => {
                OFFICE_SCHEDULE.forEach(row => {
                    const reason = mrGreenAbsenceReason(row.person, ev);
                    if (!reason) return;
                    mrGreenEachDate(ev.start, ev.end, dateStr => {
                        if (!dateStr.startsWith(yearStr)) return;
                        if (!away.get(row.person).has(dateStr)) {
                            away.get(row.person).set(dateStr, reason);
                        }
                    });
                });
            });

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const months = [];
            for (let m = 0; m < 12; m++) {
                const dim = new Date(year, m + 1, 0).getDate();
                const days = [];
                for (let day = 1; day <= dim; day++) {
                    const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dow = new Date(year, m, day).getDay();
                    if (dow === 0 || dow === 6) continue;
                    if (!OFFICE_SCHEDULE.some(row => dateStr >= row.startDate)) continue;

                    const holidayTitle = nlByDate.get(dateStr) || null;
                    const people = [];
                    const absent = [];
                    if (!holidayTitle) {
                        OFFICE_SCHEDULE.forEach(row => {
                            if (dateStr < row.startDate) return;
                            const weekdays = mrGreenWeekdaysOn(row.person, dateStr);
                            if (!(weekdays || []).includes(dow)) return;
                            const reason = away.get(row.person).get(dateStr);
                            if (reason) {
                                absent.push({ person: row.person, reason: reason });
                                return;
                            }
                            people.push({
                                person: row.person,
                                weekdays: weekdays,
                                expectedDays: row.expectedDays
                            });
                        });
                    }
                    days.push({
                        dateStr: dateStr,
                        dow: dow,
                        day: day,
                        holidayTitle: holidayTitle,
                        people: people,
                        absent: absent
                    });
                }
                if (days.length) months.push({ month: m, name: monthNames[m], days: days });
            }
            return months;
        }

        // Generate office days from config
        function generateOfficeDays() {
            const cfg = officeConfig;
            const officeDays = [];
            const excludeSet = new Set(cfg.excludeDates || []);
            const extraSet = new Set(cfg.extraDates || []);
            const weekdays = new Set(cfg.officeDaysOfWeek || []);
            let officeId = 1;

            for (let month = 0; month < 12; month++) {
                const daysInMonth = new Date(2026, month + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(2026, month, day);
                    const dayOfWeek = date.getDay();
                    const monthStr = String(month + 1).padStart(2, '0');
                    const dayStr = String(day).padStart(2, '0');
                    const dateStr = `2026-${monthStr}-${dayStr}`;

                    const isRegularDay = weekdays.has(dayOfWeek) && !excludeSet.has(dateStr);
                    const isExtraDay = extraSet.has(dateStr);

                    if (isRegularDay || isExtraDay) {
                        officeDays.push({
                            id: 'office_' + officeId++,
                            title: 'Office Day',
                            start: dateStr,
                            end: dateStr,
                            type: 'office'
                        });
                    }
                }
            }
            return officeDays;
        }
        // Add office days to events
        events = [...CALENDAR_EVENTS, ...generateOfficeDays()];
        
        // Fetch custom events from Google Sheet
        async function loadSavedEvents() {
            try {
                console.log('Fetching events from Google Sheet...');
                const response = await fetch(APPS_SCRIPT_URL + '?action=list');
                const data = await response.json();
                if (data.success && data.events) {
                    // Normalize dates from sheet (Google Sheets returns ISO timestamps with timezone shift)
                    function normalizeDate(val) {
                        const s = String(val);
                        if (s.includes('T')) {
                            // Parse as UTC and format as YYYY-MM-DD using UTC components
                            const d = new Date(s);
                            // Round to nearest date to handle timezone shifts
                            d.setUTCHours(d.getUTCHours() + 12);
                            return d.toISOString().slice(0, 10);
                        }
                        return s.slice(0, 10);
                    }
                    const sheetEvents = data.events.map(e => ({
                        ...e,
                        start: normalizeDate(e.start),
                        end: normalizeDate(e.end)
                    }));
                    console.log('Loaded from sheet:', sheetEvents.length, 'events');
                    // Cache in localStorage as fallback
                    localStorage.setItem('calendarBirthdays', JSON.stringify(sheetEvents));
                    events = [...CALENDAR_EVENTS, ...generateOfficeDays(), ...sheetEvents];
                } else {
                    console.warn('Sheet fetch failed, using localStorage fallback');
                    loadFromLocalStorage();
                }
            } catch (err) {
                console.warn('Sheet unavailable, using localStorage fallback:', err);
                loadFromLocalStorage();
            }
            renderCalendar();
        }

        function loadFromLocalStorage() {
            const saved = localStorage.getItem('calendarBirthdays');
            if (saved) {
                const cached = JSON.parse(saved);
                events = [...CALENDAR_EVENTS, ...generateOfficeDays(), ...cached];
            }
        }

        // Save to Google Sheet (add)
        async function saveEventToSheet(newEvent) {
            try {
                const params = new URLSearchParams({ action: 'add' });
                for (const [key, val] of Object.entries(newEvent)) {
                    if (val) params.set(key, val);
                }
                await fetch(APPS_SCRIPT_URL + '?' + params.toString());
                console.log('Event saved to sheet');
            } catch (err) {
                console.error('Failed to save to sheet:', err);
            }
        }

        // Delete from Google Sheet
        async function deleteEventFromSheet(eventId) {
            try {
                await fetch(APPS_SCRIPT_URL + '?action=delete&id=' + encodeURIComponent(eventId));
                console.log('Event deleted from sheet');
            } catch (err) {
                console.error('Failed to delete from sheet:', err);
            }
        }

        function saveBirthdays() {
            // Keep localStorage as cache
            const userCreatedEvents = events.filter(e => e.id && e.id.includes('_custom_'));
            localStorage.setItem('calendarBirthdays', JSON.stringify(userCreatedEvents));
        }

        function changeView(view) {
            currentView = view;
            document.querySelectorAll('.view-buttons .btn-secondary').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            renderCalendar();
        }

        function navigate(direction) {
            if (currentView === 'year' || currentView === 'holidays') {
                currentYear += direction;
            } else if (currentView === 'month') {
                currentMonth += direction;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                } else if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
            } else if (currentView === 'week') {
                currentWeekStart = new Date(currentWeekStart);
                currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
            }
            renderCalendar();
        }

        function legendTypes() {
            return Array.from(document.querySelectorAll('.legend-item[data-type]'))
                .map(el => el.dataset.type);
        }

        function syncLegend() {
            document.querySelectorAll('.legend-item[data-type]').forEach(el => {
                el.classList.toggle('dimmed', !!hiddenTypes[el.dataset.type]);
                el.classList.remove('active');
            });
            const btn = document.getElementById('legendBulkBtn');
            if (!btn) return;
            const types = legendTypes();
            const allHidden = types.length > 0 && types.every(t => hiddenTypes[t]);
            btn.textContent = allHidden ? 'Select all' : 'Deselect all';
        }

        function toggleFilter(type) {
            hiddenTypes[type] = !hiddenTypes[type];
            syncLegend();
            renderCalendar();
        }

        function toggleAllFilters() {
            const types = legendTypes();
            const allHidden = types.length > 0 && types.every(t => hiddenTypes[t]);
            types.forEach(t => { hiddenTypes[t] = !allHidden; });
            syncLegend();
            renderCalendar();
        }

        function getEventsForDate(date) {
            // Normalize to local date string for comparison (YYYY-MM-DD)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            return events.filter(event => {
                // Legend data, not calendar entries.
                const eventType = String(event.type || '').trim();
                const eventId = String(event.id || '');
                if (eventType === 'mrgreen-expected' || eventType === 'mrgreen-weekdays') return false;
                if (eventId.indexOf('mrgreen-expected_custom_') === 0 || eventId.indexOf('mrgreen-weekdays_custom_') === 0) return false;
                if (hiddenTypes[event.type]) return false;
                return event.start <= dateStr && event.end >= dateStr;
            });
        }

        function renderYearView() {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            let html = '<div class="year-view">';
            
            const today = new Date();
            const isThisCalendarYear = currentYear === today.getFullYear();
            for (let month = 0; month < 12; month++) {
                const isCurrentMonth = isThisCalendarYear && month === today.getMonth();
                html += `<div class="month-mini${isCurrentMonth ? ' current-month' : ''}" id="year-month-${month}" onclick="goToMonth(${month})">`;
                html += `<h3>${monthNames[month]}</h3>`;
                html += '<div class="mini-calendar">';
                
                // Day headers
                ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(day => {
                    html += `<div class="mini-day-header">${day}</div>`;
                });
                
                // Get first day of month (adjust for Monday start)
                const firstDay = new Date(currentYear, month, 1);
                const lastDay = new Date(currentYear, month + 1, 0);
                let startingDayOfWeek = firstDay.getDay() - 1; // Adjust so Monday = 0
                if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes 6
                
                // Previous month days
                for (let i = 0; i < startingDayOfWeek; i++) {
                    html += '<div class="mini-day other-month"></div>';
                }
                
                // Current month days
                for (let day = 1; day <= lastDay.getDate(); day++) {
                    const date = new Date(currentYear, month, day);
                    const dayEvents = getEventsForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    // Determine primary color class
                    let colorClass = '';
                    if (dayEvents.length > 0) {
                        const eventTypes = dayEvents.map(e => e.type);
                        if (eventTypes.length > 1 && new Set(eventTypes).size > 1) {
                            colorClass = 'multiple';
                        } else {
                            colorClass = dayEvents[0].type;
                        }
                    }
                    
                    html += `<div class="mini-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-event ' + colorClass : ''}">`;
                    html += `<div class="mini-day-number">${day}</div>`;
                    
                    if (dayEvents.length > 0) {
                        // Add tooltip with event names
                        html += '<div class="mini-day-tooltip">';
                        dayEvents.forEach((evt, idx) => {
                            if (idx > 0) html += '<br>';
                            html += evt.title;
                        });
                        html += '</div>';
                    }
                    
                    html += '</div>';
                }
                
                html += '</div></div>';
            }
            
            html += '</div>';
            
            document.getElementById('calendarContent').innerHTML = html;
            document.getElementById('currentPeriod').textContent = currentYear;
            if (isThisCalendarYear) {
                const el = document.getElementById('year-month-' + today.getMonth());
                if (el) {
                    requestAnimationFrame(() => {
                        el.scrollIntoView({ behavior: 'auto', block: 'start' });
                    });
                }
            }
        }

        function goToMonth(month) {
            currentMonth = month;
            changeView('month');
            document.querySelectorAll('.view-buttons .btn-secondary').forEach((btn, idx) => {
                btn.classList.remove('active');
                if (idx === 1) btn.classList.add('active');
            });
        }

        function renderMonthView() {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const monthLength = lastDay.getDate();
            
            // Get day of week for first day (0=Sunday, 1=Monday, ..., 6=Saturday)
            let startingDayOfWeek = firstDay.getDay();
            // Convert to Monday start (0=Monday, 1=Tuesday, ..., 6=Sunday)
            startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
            
            let html = '<div class="month-view"><div class="month-grid">';
            
            // Day headers
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
                html += `<div class="day-header">${day}</div>`;
            });
            
            // Previous month days
            const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
            for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                const day = prevMonthLastDay - i;
                html += `<div class="day-cell other-month"><div class="day-number">${day}</div></div>`;
            }
            
            // Current month days
            for (let day = 1; day <= monthLength; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                html += `<div class="day-cell ${isToday ? 'today' : ''}" onclick="dayClick('${date.toISOString()}')">`;
                html += `<div class="day-number">${day}</div>`;
                html += '<div class="day-events">';
                
                dayEvents.forEach(event => {
                    html += `<div class="event-badge ${event.type}" onclick="event.stopPropagation(); viewEvent('${event.id}')" title="${event.title}">${event.title}</div>`;
                });
                
                html += '</div></div>';
            }
            
            // Next month days
            const usedCells = startingDayOfWeek + monthLength;
            const remainingCells = 42 - usedCells;
            for (let day = 1; day <= remainingCells; day++) {
                html += `<div class="day-cell other-month"><div class="day-number">${day}</div></div>`;
            }
            
            html += '</div></div>';
            
            document.getElementById('calendarContent').innerHTML = html;
            document.getElementById('currentPeriod').textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }

        function renderWeekView() {
            const weekStart = new Date(currentWeekStart);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            let html = '<div class="week-view"><div class="week-grid">';
            
            // Empty corner cell
            html += '<div class="time-slot"></div>';
            
            // Day headers
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                const isToday = date.toDateString() === new Date().toDateString();
                const dayOfWeek = date.getDay();
                const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
                html += `<div class="week-day-header ${isToday ? 'today' : ''}">
                    ${dayNames[adjustedDayIndex]}<br>
                    ${monthNames[date.getMonth()]} ${date.getDate()}
                </div>`;
            }
            
            // All day events
            html += '<div class="time-slot">All Day</div>';
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                html += `<div class="week-day-cell ${isToday ? 'today' : ''}">`;
                dayEvents.forEach(event => {
                    html += `<div class="week-event ${event.type}" onclick="viewEvent('${event.id}')">${event.title}</div>`;
                });
                html += '</div>';
            }
            
            html += '</div></div>';
            
            document.getElementById('calendarContent').innerHTML = html;
            
            const startStr = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;
            const endStr = `${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
            document.getElementById('currentPeriod').textContent = `${startStr} - ${endStr}`;
        }
