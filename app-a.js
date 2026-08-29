// Password protection — local preview skips the gate so the calendar is usable here.
        (function() {
            const correctPassword = 'NLCAM';
            const sessionKey = 'calendarAuthenticated';
            const localHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(location.hostname);
            const gate = document.getElementById('passwordGate');
            const app = document.getElementById('appContainer');

            function showApp() {
                if (gate) gate.hidden = true;
                if (app) app.hidden = false;
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
        let currentYear = 2026;
        let currentMonth = 0; // January
        let currentWeekStart = new Date(2026, 0, 1);
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
        
        // Set initial week start to first Monday of 2026
        let initialWeekStart = new Date(2026, 0, 1);
        while (initialWeekStart.getDay() !== 1) {
            initialWeekStart.setDate(initialWeekStart.getDate() + 1);
        }
        currentWeekStart = initialWeekStart;

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

        function toggleFilter(type) {
            hiddenTypes[type] = !hiddenTypes[type];
            document.querySelectorAll('.legend-item[data-type]').forEach(el => {
                el.classList.toggle('dimmed', !!hiddenTypes[el.dataset.type]);
                el.classList.remove('active');
            });
            renderCalendar();
        }

        function getEventsForDate(date) {
            // Normalize to local date string for comparison (YYYY-MM-DD)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            return events.filter(event => {
                if (hiddenTypes[event.type]) return false;
                return event.start <= dateStr && event.end >= dateStr;
            });
        }

        function renderYearView() {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            let html = '<div class="year-view">';
            
            for (let month = 0; month < 12; month++) {
                html += `<div class="month-mini" onclick="goToMonth(${month})">`;
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
