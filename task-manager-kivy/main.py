import os
import csv
import logging
from datetime import datetime, date
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.popup import Popup
from kivy.uix.scrollview import ScrollView
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.graphics import Color, Rectangle

# Set up logging
def setup_logging():
    """Set up logging configuration"""
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    log_filename = f"logs/task_manager_{datetime.now().strftime('%Y%m%d')}.log"
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_filename),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

class DateInput(TextInput):
    """Custom date input with validation"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.hint_text = "YYYY-MM-DD"
        self.multiline = False
        
    def insert_text(self, substring, from_undo=False):
        # Allow only numbers and dashes
        if substring.isdigit() or substring == '-':
            return super().insert_text(substring, from_undo)
        return
    
    def validate_date(self):
        """Validate if the entered date is valid"""
        try:
            if self.text:
                datetime.strptime(self.text, '%Y-%m-%d')
                return True
        except ValueError:
            return False
        return True

class DescriptionInput(TextInput):
    """Custom description input with character limit"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.multiline = True
        self.hint_text = "Enter task description (max 1000 characters)"
        
    def insert_text(self, substring, from_undo=False):
        # Limit to 1000 characters
        if len(self.text) + len(substring) <= 1000:
            return super().insert_text(substring, from_undo)
        return

class TaskForm(BoxLayout):
    """Main task form widget"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = 'vertical'
        self.spacing = 10
        self.padding = 20
        
        # Set background color
        with self.canvas.before:
            Color(0.95, 0.95, 0.95, 1)  # Light gray background
            self.rect = Rectangle(size=self.size, pos=self.pos)
        
        self.bind(size=self._update_rect, pos=self._update_rect)
        
        self.create_form()
        self.create_data_directory()
        
    def _update_rect(self, instance, value):
        """Update background rectangle"""
        self.rect.pos = instance.pos
        self.rect.size = instance.size
        
    def create_data_directory(self):
        """Create data directory if it doesn't exist"""
        if not os.path.exists('data'):
            os.makedirs('data')
            logger.info("Created data directory")
    
    def create_form(self):
        """Create the form elements"""
        # Title
        title_label = Label(text='Task Manager', font_size=24, size_hint_y=None, height=50, color=(0.2, 0.2, 0.2, 1))
        self.add_widget(title_label)
        
        # Form container
        form_container = GridLayout(cols=2, spacing=10, size_hint_y=None)
        form_container.bind(minimum_height=form_container.setter('height'))
        
        # Title field
        form_container.add_widget(Label(text='Title:', size_hint_y=None, height=40, color=(0.3, 0.3, 0.3, 1)))
        self.title_input = TextInput(
            multiline=False, 
            size_hint_y=None, 
            height=40,
            background_color=(1, 1, 1, 1),
            foreground_color=(0, 0, 0, 1)
        )
        form_container.add_widget(self.title_input)
        
        # Due date field
        form_container.add_widget(Label(text='Due Date:', size_hint_y=None, height=40, color=(0.3, 0.3, 0.3, 1)))
        self.due_date_input = DateInput(size_hint_y=None, height=40, background_color=(1, 1, 1, 1), foreground_color=(0, 0, 0, 1))
        form_container.add_widget(self.due_date_input)
        
        # Description field
        form_container.add_widget(Label(text='Description:', size_hint_y=None, height=40, color=(0.3, 0.3, 0.3, 1)))
        desc_container = BoxLayout(orientation='vertical', size_hint_y=None, height=120)
        
        self.description_input = DescriptionInput(
            size_hint_y=None, 
            height=100,
            background_color=(1, 1, 1, 1),
            foreground_color=(0, 0, 0, 1)
        )
        self.char_counter = Label(
            text='0/1000', 
            size_hint_y=None, 
            height=20, 
            color=(0.5, 0.5, 0.5, 1),
            halign='right'
        )
        
        # Bind description input to update character counter
        self.description_input.bind(text=self.update_char_counter)
        
        desc_container.add_widget(self.description_input)
        desc_container.add_widget(self.char_counter)
        form_container.add_widget(desc_container)
        
        self.add_widget(form_container)
        
        # Buttons
        button_container = BoxLayout(orientation='horizontal', spacing=10, size_hint_y=None, height=50)
        
        self.clear_button = Button(
            text='Clear', 
            size_hint_x=0.5,
            background_color=(0.8, 0.8, 0.8, 1),
            color=(0.2, 0.2, 0.2, 1)
        )
        self.clear_button.bind(on_press=self.clear_form)
        
        self.submit_button = Button(
            text='Submit', 
            size_hint_x=0.5,
            background_color=(0.2, 0.6, 1, 1),
            color=(1, 1, 1, 1)
        )
        self.submit_button.bind(on_press=self.submit_form)
        
        button_container.add_widget(self.clear_button)
        button_container.add_widget(self.submit_button)
        
        self.add_widget(button_container)
        
        # Status label
        self.status_label = Label(
            text='Ready to create tasks', 
            size_hint_y=None, 
            height=30,
            color=(0.2, 0.6, 0.2, 1)
        )
        self.add_widget(self.status_label)
    
    def update_char_counter(self, instance, text):
        """Update character counter for description field"""
        char_count = len(text)
        self.char_counter.text = f'{char_count}/1000'
        
        # Change color based on character count
        if char_count > 950:
            self.char_counter.color = (1, 0, 0, 1)  # Red
        elif char_count > 800:
            self.char_counter.color = (1, 0.5, 0, 1)  # Orange
        else:
            self.char_counter.color = (0.5, 0.5, 0.5, 1)  # Gray
    
    def clear_form(self, instance):
        """Clear all form fields"""
        try:
            self.title_input.text = ''
            self.due_date_input.text = ''
            self.description_input.text = ''
            self.status_label.text = 'Form cleared'
            self.status_label.color = (0.2, 0.6, 0.2, 1)  # Green
            logger.info("Form cleared by user")
        except Exception as e:
            error_msg = f"Error clearing form: {str(e)}"
            logger.error(error_msg)
            self.show_error_popup("Error", error_msg)
    
    def validate_form(self):
        """Validate form data"""
        errors = []
        
        # Check title
        if not self.title_input.text.strip():
            errors.append("Title is required")
        
        # Check due date
        if not self.due_date_input.text.strip():
            errors.append("Due date is required")
        elif not self.due_date_input.validate_date():
            errors.append("Due date must be in YYYY-MM-DD format")
        
        # Check description
        if not self.description_input.text.strip():
            errors.append("Description is required")
        elif len(self.description_input.text) > 1000:
            errors.append("Description must be 1000 characters or less")
        
        return errors
    
    def submit_form(self, instance):
        """Submit form data to CSV"""
        try:
            # Log user input attempt
            logger.info(f"Submit attempt - Title: '{self.title_input.text}', Due: '{self.due_date_input.text}', Description length: {len(self.description_input.text)}")
            
            # Validate form
            errors = self.validate_form()
            if errors:
                error_message = "Please fix the following errors:\n" + "\n".join(errors)
                logger.warning(f"Form validation failed: {errors}")
                self.show_error_popup("Validation Error", error_message)
                self.status_label.text = 'Please fix validation errors'
                self.status_label.color = (1, 0, 0, 1)  # Red
                return
            
            # Prepare data
            current_date = datetime.now().strftime('%Y-%m-%d')
            current_time = datetime.now().strftime('%H:%M:%S')
            
            task_data = {
                'creation_date': current_date,
                'creation_time': current_time,
                'title': self.title_input.text.strip(),
                'due_date': self.due_date_input.text.strip(),
                'description': self.description_input.text.strip()
            }
            
            # Save to CSV
            self.save_to_csv(task_data, current_date)
            
            # Clear form after successful submission
            self.clear_form(None)
            self.status_label.text = 'Task saved successfully!'
            self.status_label.color = (0.2, 0.6, 0.2, 1)  # Green
            
            logger.info(f"Task saved successfully: {task_data['title']}")
            
        except Exception as e:
            error_msg = f"Error submitting form: {str(e)}"
            logger.error(f"{error_msg} - User input: Title='{self.title_input.text}', Due='{self.due_date_input.text}', Desc length={len(self.description_input.text)}")
            self.show_error_popup("Error", error_msg)
            self.status_label.text = 'Error saving task'
            self.status_label.color = (1, 0, 0, 1)  # Red
    
    def save_to_csv(self, task_data, date_str):
        """Save task data to CSV file"""
        try:
            filename = f"data/tasks_{date_str}.csv"
            file_exists = os.path.isfile(filename)
            
            # CSV headers
            headers = ['creation_date', 'creation_time', 'title', 'due_date', 'description']
            
            with open(filename, 'a', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=headers)
                
                # Write header if file is new
                if not file_exists:
                    writer.writeheader()
                    logger.info(f"Created new CSV file: {filename}")
                
                # Write task data
                writer.writerow(task_data)
                logger.info(f"Task data written to {filename}")
                
        except Exception as e:
            error_msg = f"Error saving to CSV: {str(e)}"
            logger.error(f"{error_msg} - Task data: {task_data}")
            raise Exception(error_msg)
    
    def show_error_popup(self, title, message):
        """Show error popup to user"""
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        error_label = Label(
            text=message, 
            text_size=(400, None),
            halign='left',
            valign='top'
        )
        content.add_widget(error_label)
        
        close_button = Button(text='Close', size_hint_y=None, height=40)
        content.add_widget(close_button)
        
        popup = Popup(
            title=title,
            content=content,
            size_hint=(0.8, 0.6),
            auto_dismiss=False
        )
        
        close_button.bind(on_press=popup.dismiss)
        popup.open()

class TaskManagerApp(App):
    """Main application class"""
    def build(self):
        """Build the application"""
        Window.size = (600, 500)
        Window.title = 'Task Manager'
        
        logger.info("Task Manager application started")
        
        # Create main form
        main_form = TaskForm()
        
        # Create scroll view for better mobile compatibility
        scroll = ScrollView()
        scroll.add_widget(main_form)
        
        return scroll
    
    def on_stop(self):
        """Called when application is closing"""
        logger.info("Task Manager application stopped")

if __name__ == '__main__':
    try:
        TaskManagerApp().run()
    except Exception as e:
        logger.error(f"Fatal error starting application: {str(e)}")
        print(f"Error starting application: {str(e)}")