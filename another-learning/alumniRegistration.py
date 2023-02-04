from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.gridlayout import GridLayout
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
import logging


class LoginApp(GridLayout):
    # **kwargs keyword is to used accept and process all arguments supplied

    def __init__(self, **kwargs):
        # super method calls GridLayout creates constructor for class and passes all the arguments
        super(LoginApp, self).__init__(**kwargs)

        # configures no of cols required for submit button
        self.cols = 1

        # initializes new layout to host forms
        self.inside = GridLayout()

        self.inside.cols = 2  # configures no of cols required to host form

        # configure form fields and labels
        self.inside.add_widget(Label(text="First Name: "))
        self.firstname = TextInput(multiline=False)
        self.inside.add_widget(self.firstname)

        self.inside.add_widget(Label(text="Last Name: "))
        self.lastname = TextInput(multiline=False)
        self.inside.add_widget(self.lastname)

        self.inside.add_widget(Label(text="Email: "))
        self.email = TextInput(multiline=False)
        self.inside.add_widget(self.email)

        self.inside.add_widget(Label(text="Permanent Address: "))
        self.paddress = TextInput(multiline=False)
        self.inside.add_widget(self.paddress)

        self.inside.add_widget(Label(text="Current Address: "))
        self.caddress = TextInput(multiline=False)
        self.inside.add_widget(self.caddress)

        self.inside.add_widget(Label(text="Mobile: "))
        self.mobile = TextInput(multiline=False)
        self.inside.add_widget(self.mobile)

        self.inside.add_widget(Label(text="Degree: "))
        self.degree = TextInput(multiline=False)
        self.inside.add_widget(self.degree)

        self.inside.add_widget(Label(text="Branch: "))
        self.branch = TextInput(multiline=False)
        self.inside.add_widget(self.branch)

        self.inside.add_widget(Label(text="Graduation Year: "))
        self.yog = TextInput(multiline=False)
        self.inside.add_widget(self.yog)

        self.inside.add_widget(Label(text="Employer: "))
        self.employer = TextInput(multiline=False)
        self.inside.add_widget(self.employer)

        self.inside.add_widget(Label(text="Designation: "))
        self.designation = TextInput(multiline=False)
        self.inside.add_widget(self.designation)

        # adds the forms to layout
        self.add_widget(self.inside)

        self.submit = Button(text="Submit", font_size=40)

        self.submit.bind(on_press=self.on_submit)

        # adds the button to layout
        self.add_widget(self.submit)

    # configures behavior of submit button
    def on_submit(self, instance):
        logging.info(f"Button Pressed")

        fname = self.firstname.text
        lname = self.lastname.text
        personalEmail = self.email.text
        personalCell = self.mobile.text
        permanent_address = self.paddress.text
        current_address = self.caddress.text
        graduation_degree = self.degree.text
        graduation_branch = self.branch.text
        graduation_year = self.yog.text
        current_employer = self.employer.text
        current_designation = self.designation.text

        logging.info({
            "first_name": fname,
            "last_name": lname,
            "personal_email": personalEmail,
            "mobile": personalCell,
            "addresses": [{
                "permanent": permanent_address,
                "current": current_address
            }],
            "education": [{
                "degree": graduation_degree,
                "branch": graduation_branch,
                "year": graduation_year
            }],
            "employer": current_employer,
            "designation": current_designation
        })

        # resets the fields to empty string
        self.firstname.text = ""
        self.lastname.text = ""
        self.mobile.text = ""
        self.email.text = ""
        self.degree.text = ""
        self.branch.text = ""
        self.yog.text = ""
        self.paddress.text = ""
        self.caddress.text = ""
        self.employer.text = ""
        self.designation.text = ""


class MyApp(App):
    def build(self):
        return LoginApp()


if __name__ == '__main__':
    app = MyApp()
    app.run()
