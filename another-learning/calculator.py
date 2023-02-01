from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput


class MainApp(App):
    def build(self):
        self.operators = ["/", "*", "+", "-"]
        self.last_was_operator = None
        self.last_button = None

        main_layout = BoxLayout(orientation="vertical")  # top level layout
        self.solution = TextInput(
            multiline=False, readonly=True, halign="right", font_size="55")
        main_layout.add_widget(self.solution)

        # following list is list of buttons
        button = [
            ["7", "8", "9", "/"],
            ["4", "5", "6", "*"],
            ["1", "2", "3", "-"],
            [".", "0", "C", "+"]
        ]

        for row in button:
            # create box horizontal orientation
            horizontal_layout = BoxLayout()

            # iterate over nested items in each list
            for label in row:

                # create buttons for rows
                button = Button(
                    text=label,
                    pos_hint={"center_x": 0.5, "center_y": 0.5},
                )
                button.bind(on_press=self.on_button_press)
                
                # adds buttons to horizontal box layout
                horizontal_layout.add_widget(button)

            # adds horizontal layout to main layout
            main_layout.add_widget(horizontal_layout)

        equals_button = Button(
            text="=", pos_hint={"center_x": 0.5, "center_y": 0.5}
        )

        equals_button.bind(on_press=self.on_solution)
        
        # add equals button to main layout
        main_layout.add_widget(equals_button)

        return main_layout

    def on_button_press(self, instance):
        
        # values of button text and solution are extracted to variables
        current = self.solution.text
        button_text = instance.text

        if button_text == "C":
            
            # Clear the solution widget
            self.solution.text = ""
        else:
            
            # this checks if there are any pre-existing values
            # and whether the last button clicked was an operator button
            if current and (
                self.last_was_operator and button_text in
                self.operators
            ):
                
                # if the above is true, Don't add two operators right after another
                return
            elif current == "" and button_text in self.operators:
                
                # First characters cannot be an operator
                return
            else:
                
                # if none of the above conditions are met then
                # solution is updated with a new text
                new_text = current + button_text
                self.solution.text = new_text
        
        # last_button value is set to last button pressed        
        self.last_button = button_text
        
        # last_was_operator is set true or false whether or not last character 
        # was an operator
        self.last_was_operator = self.last_button in self.operators

    def on_solution(self, instance):
        
        # get current text from solution
        text = self.solution.text
        
        if text:
            # if user created a formula then eval will run the 
            # formula and return output
            # eval should be refrained from being used as it can run arbitrary code
            # it's safe to use in this context as we are only dealing with integers
            
            solution = str(eval(self.solution.text))
            
            # sets the new value for solution widget
            self.solution.text = solution


if __name__ == "__main__":
    app = MainApp()
    app.run()
