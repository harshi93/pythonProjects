// DevOps to Team Lead Progress Tracker
// Main application logic

class ProgressTracker {
    constructor() {
        this.currentDay = 1;
        this.tasks = this.initializeTasks();
        this.metrics = {};
        this.journalEntries = [];
        this.weeklyReflections = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        this.renderPhases();
        this.updateProgress();
        this.setCurrentDate();
    }

    // Initialize all tasks from the 90-day plan
    initializeTasks() {
        return {
            phase1: {
                week1: [
                    {
                        id: 'p1w1t1',
                        title: 'Conduct 1:1 meetings with each team member',
                        description: '30-45 minutes each, document strengths, goals, and pain points',
                        days: '1-3',
                        completed: false
                    },
                    {
                        id: 'p1w1t2',
                        title: 'Review current DevOps workflows and toolchain',
                        description: 'Analyze incident response procedures and deployment pipelines',
                        days: '1-3',
                        completed: false
                    },
                    {
                        id: 'p1w1t3',
                        title: 'Map stakeholders and relationships',
                        description: 'Identify key stakeholders, communication channels, and expectations',
                        days: '1-3',
                        completed: false
                    },
                    {
                        id: 'p1w1t4',
                        title: 'Fix 2-3 obvious process bottlenecks',
                        description: 'Implement immediate improvements and address urgent technical issues',
                        days: '4-7',
                        completed: false
                    },
                    {
                        id: 'p1w1t5',
                        title: 'Establish regular team meeting cadence',
                        description: 'Set up communication rhythms and meeting schedules',
                        days: '4-7',
                        completed: false
                    }
                ],
                week2: [
                    {
                        id: 'p1w2t1',
                        title: 'Complete "First-Time Manager" online course',
                        description: 'LinkedIn Learning or Coursera course on management fundamentals',
                        days: '8-14',
                        completed: false
                    },
                    {
                        id: 'p1w2t2',
                        title: 'Read "The Manager\'s Path" Chapters 1-3',
                        description: 'Study engineering leadership fundamentals by Camille Fournier',
                        days: '8-14',
                        completed: false
                    },
                    {
                        id: 'p1w2t3',
                        title: 'Shadow current manager in leadership meetings',
                        description: 'Practice active listening and document team decisions',
                        days: '8-14',
                        completed: false
                    }
                ],
                week3: [
                    {
                        id: 'p1w3t1',
                        title: 'Organize team retrospective session',
                        description: 'Facilitate problem-solving workshop and establish psychological safety',
                        days: '15-21',
                        completed: false
                    },
                    {
                        id: 'p1w3t2',
                        title: 'Implement team charter and working agreements',
                        description: 'Create team dashboard for metrics and goals',
                        days: '15-21',
                        completed: false
                    },
                    {
                        id: 'p1w3t3',
                        title: 'Set up regular 1:1 schedule',
                        description: 'Bi-weekly initially, implement structured incident post-mortems',
                        days: '15-21',
                        completed: false
                    }
                ],
                week4: [
                    {
                        id: 'p1w4t1',
                        title: 'Improve CI/CD pipeline monitoring',
                        description: 'Establish SLA/SLO definitions and tracking',
                        days: '22-30',
                        completed: false
                    },
                    {
                        id: 'p1w4t2',
                        title: 'Create runbooks for common procedures',
                        description: 'Document standard operating procedures and deployment standards',
                        days: '22-30',
                        completed: false
                    },
                    {
                        id: 'p1w4t3',
                        title: 'Build incident response playbooks',
                        description: 'Set up automated alerting and response procedures',
                        days: '22-30',
                        completed: false
                    }
                ]
            },
            phase2: {
                week5: [
                    {
                        id: 'p2w5t1',
                        title: 'Learn performance review processes',
                        description: 'Practice giving constructive feedback and conflict resolution',
                        days: '31-37',
                        completed: false
                    },
                    {
                        id: 'p2w5t2',
                        title: 'Conduct mid-cycle performance check-ins',
                        description: 'Create individual development plans for team members',
                        days: '31-37',
                        completed: false
                    },
                    {
                        id: 'p2w5t3',
                        title: 'Implement peer feedback mechanisms',
                        description: 'Address performance issues proactively',
                        days: '31-37',
                        completed: false
                    }
                ],
                week6: [
                    {
                        id: 'p2w6t1',
                        title: 'Complete coaching skills workshop',
                        description: 'Read "The Coaching Habit" and practice GROW model',
                        days: '38-44',
                        completed: false
                    },
                    {
                        id: 'p2w6t2',
                        title: 'Mentor junior team members',
                        description: 'Coach on technical skills and career development',
                        days: '38-44',
                        completed: false
                    },
                    {
                        id: 'p2w6t3',
                        title: 'Facilitate knowledge sharing sessions',
                        description: 'Support team members in stretch assignments',
                        days: '38-44',
                        completed: false
                    }
                ],
                week7: [
                    {
                        id: 'p2w7t1',
                        title: 'Learn OKR methodology',
                        description: 'Understand business impact measurement and technology roadmap planning',
                        days: '45-51',
                        completed: false
                    },
                    {
                        id: 'p2w7t2',
                        title: 'Create team OKRs aligned with company goals',
                        description: 'Develop 6-month technical roadmap',
                        days: '45-51',
                        completed: false
                    },
                    {
                        id: 'p2w7t3',
                        title: 'Plan capacity and resource allocation',
                        description: 'Identify automation opportunities',
                        days: '45-51',
                        completed: false
                    }
                ],
                week8: [
                    {
                        id: 'p2w8t1',
                        title: 'Establish sync meetings with development teams',
                        description: 'Build relationships with product management and security team',
                        days: '52-60',
                        completed: false
                    },
                    {
                        id: 'p2w8t2',
                        title: 'Implement DevSecOps practices',
                        description: 'Establish shift-left testing procedures',
                        days: '52-60',
                        completed: false
                    },
                    {
                        id: 'p2w8t3',
                        title: 'Create feedback loops with development teams',
                        description: 'Integrate monitoring with business metrics',
                        days: '52-60',
                        completed: false
                    }
                ]
            },
            phase3: {
                week9: [
                    {
                        id: 'p3w9t1',
                        title: 'Study change management methodologies',
                        description: 'Learn Kotter\'s 8-step process and resistance management',
                        days: '61-67',
                        completed: false
                    },
                    {
                        id: 'p3w9t2',
                        title: 'Lead a significant process improvement initiative',
                        description: 'Implement new tooling or technology',
                        days: '61-67',
                        completed: false
                    },
                    {
                        id: 'p3w9t3',
                        title: 'Create change communication plan',
                        description: 'Manage team through organizational changes',
                        days: '61-67',
                        completed: false
                    }
                ],
                week10: [
                    {
                        id: 'p3w10t1',
                        title: 'Practice executive-level presentations',
                        description: 'Learn business language and develop storytelling for technical concepts',
                        days: '68-74',
                        completed: false
                    },
                    {
                        id: 'p3w10t2',
                        title: 'Present team metrics to senior leadership',
                        description: 'Participate in budget planning discussions',
                        days: '68-74',
                        completed: false
                    },
                    {
                        id: 'p3w10t3',
                        title: 'Advocate for team resources and priorities',
                        description: 'Contribute to technology strategy meetings',
                        days: '68-74',
                        completed: false
                    }
                ],
                week11: [
                    {
                        id: 'p3w11t1',
                        title: 'Design hiring criteria and interview process',
                        description: 'Create onboarding program for new team members',
                        days: '75-81',
                        completed: false
                    },
                    {
                        id: 'p3w11t2',
                        title: 'Implement self-service capabilities',
                        description: 'Create automated compliance and security checks',
                        days: '75-81',
                        completed: false
                    },
                    {
                        id: 'p3w11t3',
                        title: 'Build scalable monitoring and alerting',
                        description: 'Establish metrics-driven decision making',
                        days: '75-81',
                        completed: false
                    }
                ],
                week12: [
                    {
                        id: 'p3w12t1',
                        title: 'Establish innovation time (20% projects)',
                        description: 'Create experimentation framework',
                        days: '82-90',
                        completed: false
                    },
                    {
                        id: 'p3w12t2',
                        title: 'Implement continuous learning culture',
                        description: 'Foster technical excellence practices',
                        days: '82-90',
                        completed: false
                    },
                    {
                        id: 'p3w12t3',
                        title: 'Build knowledge sharing practices',
                        description: 'Establish learning and development budget',
                        days: '82-90',
                        completed: false
                    }
                ]
            }
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Task checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.classList.contains('task-checkbox')) {
                this.toggleTask(e.target.dataset.taskId, e.target.checked);
            }
        });

        // Resource checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.id.startsWith('book') || 
                e.target.id.startsWith('course') || e.target.id.startsWith('podcast')) {
                this.saveResourceProgress();
            }
        });

        // Progress satisfaction slider
        const satisfactionSlider = document.getElementById('progressSatisfaction');
        if (satisfactionSlider) {
            satisfactionSlider.addEventListener('input', (e) => {
                document.getElementById('satisfactionValue').textContent = e.target.value;
            });
        }

        // Current day input
        this.createDaySelector();
    }

    // Create day selector in header
    createDaySelector() {
        const currentDayElement = document.getElementById('currentDay');
        if (currentDayElement) {
            currentDayElement.innerHTML = `
                <select id="daySelector" onchange="progressTracker.setCurrentDay(this.value)">
                    ${Array.from({length: 90}, (_, i) => 
                        `<option value="${i + 1}" ${i + 1 === this.currentDay ? 'selected' : ''}>Day ${i + 1}</option>`
                    ).join('')}
                </select>
            `;
        }
    }

    // Set current day
    setCurrentDay(day) {
        this.currentDay = parseInt(day);
        this.updateProgress();
        this.renderCurrentWeekTasks();
        this.saveData();
    }

    // Switch between tabs
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        // Render specific content if needed
        if (tabName === 'dashboard') {
            this.renderDashboard();
        } else if (tabName.startsWith('phase')) {
            this.renderPhase(tabName);
        }
    }

    // Toggle task completion
    toggleTask(taskId, completed) {
        // Find and update task
        Object.keys(this.tasks).forEach(phase => {
            Object.keys(this.tasks[phase]).forEach(week => {
                const task = this.tasks[phase][week].find(t => t.id === taskId);
                if (task) {
                    task.completed = completed;
                }
            });
        });

        this.updateProgress();
        this.saveData();
    }

    // Calculate progress
    calculateProgress() {
        let totalTasks = 0;
        let completedTasks = 0;
        const phaseProgress = { phase1: 0, phase2: 0, phase3: 0 };
        const phaseTotals = { phase1: 0, phase2: 0, phase3: 0 };

        Object.keys(this.tasks).forEach(phase => {
            Object.keys(this.tasks[phase]).forEach(week => {
                this.tasks[phase][week].forEach(task => {
                    totalTasks++;
                    phaseTotals[phase]++;
                    if (task.completed) {
                        completedTasks++;
                        phaseProgress[phase]++;
                    }
                });
            });
        });

        const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
            overall: overallProgress,
            completed: completedTasks,
            total: totalTasks,
            phases: {
                phase1: phaseTotals.phase1 > 0 ? Math.round((phaseProgress.phase1 / phaseTotals.phase1) * 100) : 0,
                phase2: phaseTotals.phase2 > 0 ? Math.round((phaseProgress.phase2 / phaseTotals.phase2) * 100) : 0,
                phase3: phaseTotals.phase3 > 0 ? Math.round((phaseProgress.phase3 / phaseTotals.phase3) * 100) : 0
            }
        };
    }

    // Update progress displays
    updateProgress() {
        const progress = this.calculateProgress();

        // Update header stats
        document.getElementById('overallProgress').textContent = `${progress.overall}%`;
        document.getElementById('completedTasks').textContent = progress.completed;

        // Update progress circle
        const progressCircle = document.getElementById('progressCircle');
        const progressText = document.getElementById('progressText');
        if (progressCircle && progressText) {
            const angle = (progress.overall / 100) * 360;
            progressCircle.style.background = `conic-gradient(#3498db ${angle}deg, #e9ecef ${angle}deg)`;
            progressText.textContent = `${progress.overall}%`;
        }

        // Update phase progress bars
        ['phase1', 'phase2', 'phase3'].forEach(phase => {
            const fillElement = document.getElementById(`${phase}Progress`);
            const percentElement = document.getElementById(`${phase}Percent`);
            if (fillElement && percentElement) {
                fillElement.style.width = `${progress.phases[phase]}%`;
                percentElement.textContent = `${progress.phases[phase]}%`;
            }
        });
    }

    // Render dashboard
    renderDashboard() {
        this.renderCurrentWeekTasks();
        this.renderMilestones();
        this.updateProgress();
    }

    // Render current week tasks
    renderCurrentWeekTasks() {
        const currentWeekTasks = document.getElementById('currentWeekTasks');
        if (!currentWeekTasks) return;

        const currentWeek = Math.ceil(this.currentDay / 7);
        const currentPhase = this.currentDay <= 30 ? 'phase1' : this.currentDay <= 60 ? 'phase2' : 'phase3';
        const weekKey = `week${((currentWeek - 1) % 4) + 1}`;

        let tasks = [];
        if (this.tasks[currentPhase] && this.tasks[currentPhase][weekKey]) {
            tasks = this.tasks[currentPhase][weekKey];
        }

        currentWeekTasks.innerHTML = `
            <h3>Week ${currentWeek} Tasks (Days ${Math.max(1, (currentWeek - 1) * 7 + 1)}-${Math.min(90, currentWeek * 7)})</h3>
            ${tasks.length > 0 ? tasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        <div class="task-description">${task.description}</div>
                    </div>
                </div>
            `).join('') : '<p>No tasks defined for this week.</p>'}
        `;
    }

    // Render milestones
    renderMilestones() {
        const milestoneList = document.getElementById('milestoneList');
        if (!milestoneList) return;

        const milestones = [
            { title: 'Complete Team Assessment', day: 7, phase: 1 },
            { title: 'Establish Communication Rhythms', day: 14, phase: 1 },
            { title: 'Implement Team Charter', day: 21, phase: 1 },
            { title: 'Complete Phase 1 Deliverables', day: 30, phase: 1 },
            { title: 'Master People Management Basics', day: 44, phase: 2 },
            { title: 'Create Strategic Plans and OKRs', day: 51, phase: 2 },
            { title: 'Complete Phase 2 Deliverables', day: 60, phase: 2 },
            { title: 'Lead Change Initiative', day: 67, phase: 3 },
            { title: 'Present to Executive Leadership', day: 74, phase: 3 },
            { title: 'Complete 90-Day Transition', day: 90, phase: 3 }
        ];

        milestoneList.innerHTML = milestones.map(milestone => {
            const isCompleted = this.currentDay >= milestone.day;
            const isUpcoming = this.currentDay >= milestone.day - 7 && this.currentDay < milestone.day;
            
            return `
                <div class="milestone-item ${isCompleted ? 'completed' : ''}">
                    <div class="milestone-icon">
                        ${isCompleted ? '<i class="fas fa-check"></i>' : milestone.phase}
                    </div>
                    <div class="milestone-content">
                        <div class="milestone-title">${milestone.title}</div>
                        <div class="milestone-date">Day ${milestone.day} ${isUpcoming ? '(Upcoming)' : ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render phases
    renderPhases() {
        this.renderPhase('phase1');
        this.renderPhase('phase2');
        this.renderPhase('phase3');
    }

    // Render specific phase
    renderPhase(phaseId) {
        const phaseContainer = document.getElementById(`${phaseId}Weeks`);
        if (!phaseContainer) return;

        const phaseData = this.tasks[phaseId];
        if (!phaseData) return;

        phaseContainer.innerHTML = Object.keys(phaseData).map((weekKey, index) => {
            const weekNumber = phaseId === 'phase1' ? index + 1 : 
                             phaseId === 'phase2' ? index + 5 : index + 9;
            const tasks = phaseData[weekKey];
            const completedTasks = tasks.filter(task => task.completed).length;
            const progressPercent = Math.round((completedTasks / tasks.length) * 100);

            return `
                <div class="card week-card">
                    <div class="week-header">
                        <div class="week-title">Week ${weekNumber}</div>
                        <div class="week-progress">${completedTasks}/${tasks.length} (${progressPercent}%)</div>
                    </div>
                    <div class="week-content">
                        ${tasks.map(task => `
                            <div class="task-item ${task.completed ? 'completed' : ''}">
                                <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
                                <div class="task-content">
                                    <div class="task-title">${task.title}</div>
                                    <div class="task-description">${task.description} (Days ${task.days})</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Set current date
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        const journalDate = document.getElementById('journalDate');
        const feedbackWeek = document.getElementById('feedbackWeek');
        
        if (journalDate) journalDate.value = today;
        if (feedbackWeek) {
            const currentWeek = this.getWeekString(new Date());
            feedbackWeek.value = currentWeek;
        }
    }

    // Get week string for input
    getWeekString(date) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    // Get week number
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    // Save data to localStorage
    saveData() {
        const data = {
            currentDay: this.currentDay,
            tasks: this.tasks,
            metrics: this.metrics,
            journalEntries: this.journalEntries,
            weeklyReflections: this.weeklyReflections,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('devopsProgressTracker', JSON.stringify(data));
    }

    // Load data from localStorage
    loadData() {
        const savedData = localStorage.getItem('devopsProgressTracker');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.currentDay = data.currentDay || 1;
                if (data.tasks) this.tasks = data.tasks;
                if (data.metrics) this.metrics = data.metrics;
                if (data.journalEntries) this.journalEntries = data.journalEntries;
                if (data.weeklyReflections) this.weeklyReflections = data.weeklyReflections;
                
                // Load resource progress
                this.loadResourceProgress();
                this.loadMetrics();
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    // Save resource progress
    saveResourceProgress() {
        const resources = {};
        ['book', 'course', 'podcast'].forEach(type => {
            for (let i = 1; i <= 5; i++) {
                const checkbox = document.getElementById(`${type}${i}`);
                if (checkbox) {
                    resources[`${type}${i}`] = checkbox.checked;
                }
            }
        });
        localStorage.setItem('resourceProgress', JSON.stringify(resources));
    }

    // Load resource progress
    loadResourceProgress() {
        const savedResources = localStorage.getItem('resourceProgress');
        if (savedResources) {
            try {
                const resources = JSON.parse(savedResources);
                Object.keys(resources).forEach(id => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) {
                        checkbox.checked = resources[id];
                    }
                });
            } catch (error) {
                console.error('Error loading resource progress:', error);
            }
        }
    }

    // Save metrics
    saveMetrics() {
        const metrics = {
            deploymentFreq: document.getElementById('deploymentFreq')?.value || '',
            leadTimeReduction: document.getElementById('leadTimeReduction')?.value || '',
            mttrImprovement: document.getElementById('mttrImprovement')?.value || '',
            changeFailureRate: document.getElementById('changeFailureRate')?.value || '',
            teamSatisfaction: document.getElementById('teamSatisfaction')?.value || '',
            feedback360: document.getElementById('feedback360')?.value || '',
            retention: document.getElementById('retention')?.value || '',
            promotionRate: document.getElementById('promotionRate')?.value || '',
            uptime: document.getElementById('uptime')?.value || '',
            costOptimization: document.getElementById('costOptimization')?.value || '',
            securityIncidents: document.getElementById('securityIncidents')?.value || '',
            stakeholderSatisfaction: document.getElementById('stakeholderSatisfaction')?.value || ''
        };
        
        this.metrics = metrics;
        this.saveData();
        this.showMessage('Metrics saved successfully!', 'success');
    }

    // Load metrics
    loadMetrics() {
        if (this.metrics) {
            Object.keys(this.metrics).forEach(key => {
                const input = document.getElementById(key);
                if (input && this.metrics[key]) {
                    input.value = this.metrics[key];
                }
            });
        }
    }

    // Show message
    showMessage(text, type = 'success') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        const container = document.querySelector('.main-content');
        container.insertBefore(message, container.firstChild);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Modal functions
function openJournal() {
    document.getElementById('journalModal').style.display = 'block';
}

function openFeedback() {
    document.getElementById('feedbackModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Journal functions
function saveJournal() {
    const entry = {
        date: document.getElementById('journalDate').value,
        leadershipSkills: document.getElementById('leadershipSkills').value,
        teamSupport: document.getElementById('teamSupport').value,
        strategicInitiatives: document.getElementById('strategicInitiatives').value,
        keyLearnings: document.getElementById('keyLearnings').value,
        timestamp: new Date().toISOString()
    };
    
    progressTracker.journalEntries.push(entry);
    progressTracker.saveData();
    
    // Clear form
    document.getElementById('leadershipSkills').value = '';
    document.getElementById('teamSupport').value = '';
    document.getElementById('strategicInitiatives').value = '';
    document.getElementById('keyLearnings').value = '';
    
    closeModal('journalModal');
    progressTracker.showMessage('Journal entry saved!', 'success');
}

// Feedback functions
function saveFeedback() {
    const reflection = {
        week: document.getElementById('feedbackWeek').value,
        satisfaction: document.getElementById('progressSatisfaction').value,
        challenge: document.getElementById('biggestChallenge').value,
        accomplishment: document.getElementById('keyAccomplishment').value,
        improvements: document.getElementById('improvementAreas').value,
        nextFocus: document.getElementById('nextWeekFocus').value,
        timestamp: new Date().toISOString()
    };
    
    progressTracker.weeklyReflections.push(reflection);
    progressTracker.saveData();
    
    // Clear form
    document.getElementById('progressSatisfaction').value = '3';
    document.getElementById('satisfactionValue').textContent = '3';
    document.getElementById('biggestChallenge').value = '';
    document.getElementById('keyAccomplishment').value = '';
    document.getElementById('improvementAreas').value = '';
    document.getElementById('nextWeekFocus').value = '';
    
    closeModal('feedbackModal');
    progressTracker.showMessage('Weekly reflection saved!', 'success');
}

// Export progress
function exportProgress() {
    const data = {
        currentDay: progressTracker.currentDay,
        progress: progressTracker.calculateProgress(),
        tasks: progressTracker.tasks,
        metrics: progressTracker.metrics,
        journalEntries: progressTracker.journalEntries,
        weeklyReflections: progressTracker.weeklyReflections,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devops-progress-day-${progressTracker.currentDay}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    progressTracker.showMessage('Progress exported successfully!', 'success');
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
        localStorage.removeItem('devopsProgressTracker');
        localStorage.removeItem('resourceProgress');
        location.reload();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize the application
let progressTracker;
document.addEventListener('DOMContentLoaded', () => {
    progressTracker = new ProgressTracker();
});