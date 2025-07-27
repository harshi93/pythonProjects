# Task Manager - Python Kivy Desktop Application

A desktop application built with Python Kivy for managing tasks with form input, CSV storage, and comprehensive logging.

## Features

- **Task Form**: Create tasks with title, due date, and description
- **Data Validation**: Form validation with visual feedback
- **CSV Storage**: Tasks saved to date-organized CSV files
- **Logging**: Comprehensive error and activity logging
- **Clear & Submit**: Easy form management with clear and submit buttons

## Installation

1. Install Python 3.7 or higher
2. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the application:
```bash
python main.py
```

### Form Fields

- **Title**: Text input for task title (required)
- **Due Date**: Date input in YYYY-MM-DD format (required)
- **Description**: Multi-line text area with 1000 character limit (required)

### Buttons

- **Clear**: Clears all form fields without submitting
- **Submit**: Validates and saves task data, then clears form

## Data Storage

- Tasks are saved to CSV files in the `data/` directory
- Each day's tasks are stored in a separate file: `tasks_YYYY-MM-DD.csv`
- CSV columns: creation_date, creation_time, title, due_date, description

## Logging

- Log files are stored in the `logs/` directory
- One log file per day: `task_manager_YYYYMMDD.log`
- Logs include user actions, errors, warnings, and system events

## File Structure

```
├── main.py              # Main application file
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── data/               # CSV data files (created automatically)
└── logs/               # Log files (created automatically)
```

## Error Handling

The application includes comprehensive error handling with:
- Form validation with user-friendly error messages
- Exception logging with user input context
- Popup dialogs for error notifications
- Graceful failure recovery