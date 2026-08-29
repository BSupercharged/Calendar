        function renderCalendar() {
            if (currentView === 'year') {
                renderYearView();
            } else if (currentView === 'month') {
                renderMonthView();
            } else if (currentView === 'holidays') {
                renderHolidayView();
            } else {
                renderWeekView();
            }
        }

        function openAddModal() {
            document.getElementById('addModal').classList.add('active');
            document.getElementById('eventDate').valueAsDate = new Date();
            document.getElementById('eventType').value = 'birthday';
            updateFormForType();
        }

        // ─── Office Settings UI ────────────────────────────────────
        let tempOfficeConfig = null;

        function openOfficeSettings() {
            tempOfficeConfig = JSON.parse(JSON.stringify(officeConfig));
            renderOfficeSettingsUI();
            document.getElementById('officeSettingsModal').classList.add('active');
        }

        function renderOfficeSettingsUI() {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const container = document.getElementById('weekdayToggles');
            container.innerHTML = '';
            dayNames.forEach((name, idx) => {
                const active = tempOfficeConfig.officeDaysOfWeek.includes(idx);
                const btn = document.createElement('button');
                btn.textContent = name;
                btn.className = 'btn ' + (active ? 'btn-primary' : 'btn-secondary');
                btn.style.cssText = 'padding:8px 14px;min-width:52px;font-size:13px;';
                btn.onclick = () => {
                    if (active) {
                        tempOfficeConfig.officeDaysOfWeek = tempOfficeConfig.officeDaysOfWeek.filter(d => d !== idx);
                    } else {
                        tempOfficeConfig.officeDaysOfWeek.push(idx);
                        tempOfficeConfig.officeDaysOfWeek.sort();
                    }
                    renderOfficeSettingsUI();
                };
                container.appendChild(btn);
            });

            // Exclude dates list
            const exList = document.getElementById('excludeList');
            if (tempOfficeConfig.excludeDates.length === 0) {
                exList.innerHTML = '<div style="color:#aaa;font-style:italic;padding:4px 0;">None</div>';
            } else {
                exList.innerHTML = tempOfficeConfig.excludeDates.map((d, i) =>
                    `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:${i%2?'#f8f9fa':'white'};border-radius:4px;">
                        <span style="font-size:13px;">${d}</span>
                        <button onclick="removeExcludeDate(${i})" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:16px;padding:2px 6px;">✕</button>
                    </div>`
                ).join('');
            }

            // Extra dates list
            const extList = document.getElementById('extraList');
            if (tempOfficeConfig.extraDates.length === 0) {
                extList.innerHTML = '<div style="color:#aaa;font-style:italic;padding:4px 0;">None</div>';
            } else {
                extList.innerHTML = tempOfficeConfig.extraDates.map((d, i) =>
                    `<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:${i%2?'#f8f9fa':'white'};border-radius:4px;">
                        <span style="font-size:13px;">${d}</span>
                        <button onclick="removeExtraDate(${i})" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:16px;padding:2px 6px;">✕</button>
                    </div>`
                ).join('');
            }
        }

        function addExcludeDate() {
            const input = document.getElementById('newExcludeDate');
            const val = input.value;
            if (val && !tempOfficeConfig.excludeDates.includes(val)) {
                tempOfficeConfig.excludeDates.push(val);
                tempOfficeConfig.excludeDates.sort();
                input.value = '';
                renderOfficeSettingsUI();
            }
        }
        function removeExcludeDate(idx) {
            tempOfficeConfig.excludeDates.splice(idx, 1);
            renderOfficeSettingsUI();
        }

        function addExtraDate() {
            const input = document.getElementById('newExtraDate');
            const val = input.value;
            if (val && !tempOfficeConfig.extraDates.includes(val)) {
                tempOfficeConfig.extraDates.push(val);
                tempOfficeConfig.extraDates.sort();
                input.value = '';
                renderOfficeSettingsUI();
            }
        }
        function removeExtraDate(idx) {
            tempOfficeConfig.extraDates.splice(idx, 1);
            renderOfficeSettingsUI();
        }

        function applyOfficeSettings() {
            officeConfig = JSON.parse(JSON.stringify(tempOfficeConfig));
            saveOfficeConfig(officeConfig);
            // Rebuild events with new office days
            const nonOfficeEvents = events.filter(e => e.type !== 'office' || (e.id && e.id.includes('_custom_')));
            events = [...CALENDAR_EVENTS, ...generateOfficeDays(), ...nonOfficeEvents.filter(e => !CALENDAR_EVENTS.includes(e) && e.type !== 'office')];
            // Re-merge: base events + new office days + user-created events
            const userEvents = events.filter(e => e.id && e.id.includes('_custom_'));
            events = [...CALENDAR_EVENTS, ...generateOfficeDays(), ...userEvents];
            closeModal('officeSettingsModal');
            renderCalendar();
        }

        function resetOfficeSettings() {
            if (confirm('Reset office days to defaults (Monday & Thursday)?')) {
                tempOfficeConfig = JSON.parse(JSON.stringify(DEFAULT_OFFICE_CONFIG));
                renderOfficeSettingsUI();
            }
        }

        function updateFormForType() {
            const type = document.getElementById('eventType').value;
            const nameLabel = document.getElementById('nameLabel');
            const nameInput = document.getElementById('eventName');
            
            if (type === 'birthday') {
                nameLabel.textContent = 'Name';
                nameInput.placeholder = 'Team member name';
                nameInput.value = '';
                nameInput.readOnly = false;
            } else if (type === 'employee-holiday') {
                nameLabel.textContent = 'Employee Name';
                nameInput.placeholder = 'Who is taking holiday?';
                nameInput.value = '';
                nameInput.readOnly = false;
            } else if (type === 'event') {
                nameLabel.textContent = 'Event Name';
                nameInput.placeholder = 'e.g., EV Conference, Trade Show';
                nameInput.value = '';
                nameInput.readOnly = false;
            } else if (type === 'office') {
                nameLabel.textContent = 'Title';
                nameInput.value = 'Office Day';
                nameInput.readOnly = true;
            } else if (type === 'other') {
                nameLabel.textContent = 'Event Name';
                nameInput.placeholder = 'e.g., Company Meeting, Training';
                nameInput.value = '';
                nameInput.readOnly = false;
            }
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        function dayClick(dateStr) {
            const date = new Date(dateStr);
            document.getElementById('eventDate').valueAsDate = date;
            openAddModal();
        }

        function addEvent(e) {
            e.preventDefault();
            console.log('addEvent called');

            const name = document.getElementById('eventName').value;
            const date = document.getElementById('eventDate').value;
            let endDate = document.getElementById('eventEndDate').value;
            const notes = document.getElementById('eventNotes').value;
            const type = document.getElementById('eventType').value;

            console.log('Event details:', { name, date, endDate, type, notes });

            // If end date is not provided, default to start date
            if (!endDate) {
                endDate = date;
                console.log('End date was empty, set to:', endDate);
            }
            
            const newEvent = {
                id: type + '_custom_' + Date.now(),
                title: name,
                start: date,
                end: endDate,
                type: type,
                notes: notes
            };
            console.log('Created new event:', newEvent);

            // Filter out old event to avoid duplicates, keep office days
            const nonUserEvents = events.filter(e => e.id !== newEvent.id);
            events = [...nonUserEvents, newEvent];
            console.log('Events array after adding:', events.length, 'events');
            saveBirthdays();
            saveEventToSheet(newEvent);
            console.log('Event saved to sheet and localStorage');

            closeModal('addModal');
            renderCalendar();
            
            // Reset form
            document.getElementById('eventName').value = '';
            document.getElementById('eventNotes').value = '';
            document.getElementById('eventType').value = 'birthday';
        }

        function viewEvent(eventId) {
            const event = events.find(e => e.id === eventId);
            if (!event) return;
            
            const modal = document.getElementById('viewModal');
            document.getElementById('viewEventTitle').textContent = event.title;
            
            let content = '<div class="event-details">';
            
            if (event.type === 'event') {
                content += `<p><strong>📍 Location:</strong> ${event.location || 'Not specified'}</p>`;
                content += `<p><strong>📅 Date:</strong> ${formatDate(event.start)}`;
                if (event.start !== event.end) {
                    content += ` - ${formatDate(event.end)}`;
                }
                content += '</p>';
                if (event.priority) {
                    content += `<p><strong>⭐ Priority:</strong> ${event.priority}</p>`;
                }
                if (event.status) {
                    content += `<p><strong>Status:</strong> ${event.status}</p>`;
                }
                if (event.who) {
                    content += `<p><strong>Who:</strong> ${event.who}</p>`;
                }
                if (event.icp) {
                    content += `<p><strong>ICP:</strong> ${event.icp}</p>`;
                }
                if (event.notes) {
                    content += `<p><strong>Notes:</strong> ${event.notes}</p>`;
                }
                if (event.website) {
                    content += `<p><strong>🔗 Website:</strong> <a href="${event.website}" target="_blank">${event.website}</a></p>`;
                }
                // Only allow deletion if it's a user-added event (not from the original data)
                if (event.id.startsWith('event_') && event.id.includes('_custom_')) {
                    content += `<button class="btn btn-delete" onclick="deleteEvent('${event.id}')">Delete Event</button>`;
                }
            } else if (event.type === 'holiday') {
                content += `<p><strong>📅 Date:</strong> ${formatDate(event.start)}</p>`;
                content += `<p>🇳🇱 Dutch Public Holiday</p>`;
            } else if (event.type === 'birthday') {
                content += `<p><strong>🎂 Birthday:</strong> ${formatDate(event.start)}</p>`;
                if (event.notes) {
                    content += `<p><strong>📝 Notes:</strong> ${event.notes}</p>`;
                }
                content += `<button class="btn btn-delete" onclick="deleteEvent('${event.id}')">Delete Birthday</button>`;
            } else if (event.type === 'employee-holiday') {
                content += `<p><strong>🏖️ Employee Holiday:</strong> ${formatDate(event.start)}</p>`;
                content += `<p><strong>👤 Employee:</strong> ${event.title}</p>`;
                if (event.notes) {
                    content += `<p><strong>📝 Notes:</strong> ${event.notes}</p>`;
                }
                content += `<button class="btn btn-delete" onclick="deleteEvent('${event.id}')">Delete Employee Holiday</button>`;
            } else if (event.type === 'wfh') {
                content += `<p><strong>✈️ WFH (Abroad):</strong> ${formatDate(event.start)}</p>`;
                content += `<p>Working from abroad</p>`;
                if (event.notes) {
                    content += `<p><strong>📝 Notes:</strong> ${event.notes}</p>`;
                }
                if (event.id.includes('_custom_')) {
                    content += `<button class="btn btn-delete" onclick="deleteEvent('${event.id}')">Delete WFH (Abroad)</button>`;
                }
            } else if (event.type === 'office') {
                content += `<p><strong>🏢 Office Day:</strong> ${formatDate(event.start)}</p>`;
                content += `<p>Regular office day - Team works from the office</p>`;
            } else if (event.type === 'other') {
                content += `<p><strong>📌 Event:</strong> ${formatDate(event.start)}</p>`;
                if (event.notes) {
                    content += `<p><strong>📝 Notes:</strong> ${event.notes}</p>`;
                }
                content += `<button class="btn btn-delete" onclick="deleteEvent('${event.id}')">Delete Event</button>`;
            }
            
            content += '</div>';
            
            document.getElementById('viewEventContent').innerHTML = content;
            modal.classList.add('active');
        }

        function deleteEvent(eventId) {
            const event = events.find(e => e.id === eventId);
            let eventTypeName = 'event';
            
            if (event.type === 'birthday') {
                eventTypeName = 'birthday';
            } else if (event.type === 'employee-holiday') {
                eventTypeName = 'employee holiday';
            } else if (event.type === 'event') {
                eventTypeName = 'EV event';
            } else if (event.type === 'wfh') {
                eventTypeName = 'WFH (Abroad) day';
            } else if (event.type === 'office') {
                eventTypeName = 'office day';
            } else if (event.type === 'other') {
                eventTypeName = 'event';
            }
            
            if (confirm(`Are you sure you want to delete this ${eventTypeName}?`)) {
                events = events.filter(e => e.id !== eventId);
                saveBirthdays();
                deleteEventFromSheet(eventId);
                closeModal('viewModal');
                renderCalendar();
            }
        }

        function formatDate(dateStr) {
            const date = new Date(dateStr);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }

        // Initialize immediately when script loads
        (async function() {
            console.log('Initializing calendar...');
            console.log('Total base events:', CALENDAR_EVENTS.length);

            try {
                // Initialize with base events + office days
                events = [...CALENDAR_EVENTS, ...generateOfficeDays()];

                // Show calendar immediately with base events
                renderCalendar();

                // Then fetch custom events from Google Sheet (async)
                await loadSavedEvents();
                console.log('Calendar rendered successfully with', events.length, 'events');

                // Custom tooltip — replaces unreliable title attribute
                const tipEl = document.createElement('div');
                tipEl.id = 'cal-tooltip';
                document.body.appendChild(tipEl);

                document.addEventListener('mouseover', e => {
                    const el = e.target.closest('[data-tooltip]');
                    if (!el) return;
                    tipEl.textContent = el.dataset.tooltip;
                    tipEl.style.display = 'block';
                });
                document.addEventListener('mousemove', e => {
                    if (tipEl.style.display === 'block') {
                        const x = Math.min(e.clientX + 14, window.innerWidth - 295);
                        const y = Math.max(e.clientY - 44, 6);
                        tipEl.style.left = x + 'px';
                        tipEl.style.top  = y + 'px';
                    }
                });
                document.addEventListener('mouseout', e => {
                    if (!e.relatedTarget || !e.relatedTarget.closest('[data-tooltip]')) {
                        tipEl.style.display = 'none';
                    }
                });
            } catch (error) {
                console.error('Error initializing calendar:', error);
                const content = document.getElementById('calendarContent');
                if (content) {
                    content.innerHTML = '<div style="padding: 50px; text-align: center; color: red;"><h2>Error loading calendar</h2><p>' + error.message + '</p></div>';
                }
            }
        })();
    