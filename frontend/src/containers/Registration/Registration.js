import React, { PureComponent } from "react";
import validator from "validator";
import Recaptcha from "react-recaptcha";
import classes from "./Registration.module.css";
import axiosInstance from "../../config/axiosInstance";

class Registration extends PureComponent {
  state = {
    formInputs: {
      name: {
        value: "",
        valid: false
      },
      email: {
        value: "",
        valid: false
      },
      password: {
        value: "",
        valid: false
      }
    }
  };
  callback = () => {
    console.log("Done!!!!");
  };
  recaptchaRef;

  verifyCallback = response => {
    console.log("tokennnn", response);
    const data = {
      token: response,
      name: this.state.formInputs.name.value,
      email: this.state.formInputs.email.value,
      password: this.state.formInputs.password.value
    };

    axiosInstance
      .post("/auth/signup", data)
      .then(res => {
        this.recaptchaRef.reset();
      })
      .catch(err => {
        console.log(`error ${err}`);
      });
  };
  inputChangeHandler = (inputName, value) => {
    let updatedInput = inputName;
    let updatedValue = value;
    let isValid = false;
    if (updatedInput === "name") {
      isValid = !validator.isEmpty(updatedValue, {
        ignore_whitespace: true
      });
    } else if (updatedInput === "email") {
      isValid = validator.isEmail(updatedValue);
    } else {
      isValid = !validator.isEmpty(updatedValue, {
        ignore_whitespace: true
      });
    }
    this.setState(prevState => {
      return {
        ...prevState,
        formInputs: {
          ...prevState.formInputs,
          [inputName]: {
            ...prevState.inputName,
            value: updatedValue,
            valid: isValid
          }
        }
      };
    });
  };
  registerUser = () => {
    axiosInstance
      .post("/auth/signup", {
        name: this.state.formInputs.name.value,
        email: this.state.formInputs.email.value,
        password: this.state.formInputs.password.value
      })
      .then(res => {
        if (res.data.toVerify === true) {
          console.log("Please Verify");
          this.recaptchaRef.execute();
        }
      })
      .catch(err => {
        console.log("error occured during request");
      });
  };

  render() {
    return (
      <div className={classes.Form}>
        <h3> Registration Form </h3>
        <div className={classes.FormInput}>
          <label className={classes.FormLabel}> Name : </label>
          <input
            onChange={event =>
              this.inputChangeHandler("name", event.target.value)
            }
            type="text"
            value={this.state.formInputs.name.value}
          />
        </div>
        <div className={classes.FormInput}>
          <label className={classes.FormLabel}> Email : </label>
          <input
            onChange={event =>
              this.inputChangeHandler("email", event.target.value)
            }
            type="text"
            value={this.state.formInputs.email.value}
          />
        </div>
        <div className={classes.FormInput}>
          <label className={classes.FormLabel}> Password :</label>
          <input
            onChange={event =>
              this.inputChangeHandler("password", event.target.value)
            }
            type="text"
            value={this.state.formInputs.password.value}
          />
        </div>
        <button
          disabled={
            !(
              this.state.formInputs.name.valid &&
              this.state.formInputs.email.valid &&
              this.state.formInputs.password.valid
            )
          }
          onClick={this.registerUser}
        >
          Submit
        </button>
        <Recaptcha
          sitekey="6LezV-gUAAAAAO9jSqwaTHZenGZFtsHR3jWPJPh3"
          ref={e => (this.recaptchaRef = e)}
          verifyCallback={token => this.verifyCallback(token)}
          size={"invisible"}
        />
      </div>
    );
  }
}
export default Registration;
