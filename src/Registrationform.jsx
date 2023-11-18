import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useForm } from "react-hook-form";
import "./Registration.css";

export default function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useForm();

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [gender, setGender] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const password = watch("Password");

  useEffect(() => {
    // Fetch the list of cities from the server
    const fetchCities = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/cities");
        if (response.ok) {
          const data = await response.json();
          setCities(data.cities);
        } else {
          console.error("Failed to fetch cities");
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    // Fetch user profile photo
    const fetchProfilePhoto = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/profile-photo");
        if (response.ok) {
          // setProfilePhotoUrl(data.profilePhotoUrl); // Removed unused variable
        } else {
          console.error("Failed to fetch profile photo");
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      }
    };

    fetchProfilePhoto();
  }, []);

  const handleCityChange = async (city) => {
    // Fetch the corresponding areas based on the selected city
    try {
      const response = await fetch(`http://localhost:9090/api/areas?city=${city}`);
      if (response.ok) {
        const data = await response.json();
        setAreas(data.areas);
        setValue("Area", ""); // Clear the selected area when the city changes
      } else {
        console.error("Failed to fetch areas");
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }

    // setSelectedCity(city); // Removed unused variable
  };

  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("ProfilePhoto", profilePhoto);

      // Append other form data to formData
      formData.append("Fullname", data.Fullname);
      formData.append("EmailID", data.EmailID);
      formData.append("ContactNumber", data.ContactNumber);
      formData.append("Gender", gender);
      formData.append("DateOfBirth", data.DateOfBirth);
      formData.append("City", data.City);
      formData.append("Area", data.Area);
      formData.append("Password", data.Password);
      formData.append("ConfirmPassword", data.ConfirmPassword);

      const response = await fetch("http://localhost:9090/api/register", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Display success message in the form for 5 seconds
        setSuccessMessage("Registration successful");
        setTimeout(() => {
          // Reset the form values
          setValue("ProfilePhoto", "");
          setValue("Fullname", "");
          setValue("EmailID", "");
          setValue("ContactNumber", "");
          setValue("Gender", "");
          setValue("DateOfBirth", "");
          setValue("City", "");
          setValue("Area", "");
          setValue("Password", "");
          setValue("ConfirmPassword", "");

          // Reset any error messages
          clearErrors();

          // Reset the profile photo state
          setProfilePhoto(null);

          // Hide the success message
          setSuccessMessage(null);

          // Refresh the page
          window.location.reload();
        }, 5000); // 5000 milliseconds = 5 seconds
      } else {
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Container className="form-container">
        <h1 className="form-title">LOGIN</h1>
        <form className="form-wrapper" onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="ProfilePhoto" className="form-label">
            Profile Photo:
            <input
              id="ProfilePhoto"
              type="file"
              onChange={handlePhotoChange}
              className="form-input"
              accept="image/*"
            />
          </label>
          {profilePhoto && (
            <div>
              <p>Selected Photo:</p>
              <img
                src={URL.createObjectURL(profilePhoto)}
                alt="Profile Preview"
                style={{ maxWidth: "100px", maxHeight: "100px" }}
              />
            </div>
          )}
          <br />

          <label htmlFor="Fullname" className="form-label">
            Full Name:
            <input
              id="Fullname"
              {...register("Fullname", {
                required: "Full Name is required",
                minLength: {
                  value: 5,
                  message: "Full Name should have at least 5 characters",
                },
                pattern: {
                  value: /^[a-zA-Z ]+$/,
                  message: "Full Name must contain only letters",
                },
              })}
              className={`form-input ${errors.Fullname ? "error-input" : ""}`}
            />
          </label>

          {errors.Fullname && (
            <p className="error-message">{errors.Fullname.message}</p>
          )}
          <br />

          <label htmlFor="EmailID" className="form-label">
            Email ID:
            <input
              id="EmailID"
              {...register("EmailID", {
                required: "Email ID is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Please enter a valid Email ID",
                },
              })}
              className={`form-input ${errors.Fullname ? "error-input" : ""}`}
            />
          </label>

          {errors.EmailID && (
            <p className="error-message">{errors.EmailID.message}</p>
          )}
          <br />

          <label htmlFor="ContactNumber" className="form-label">
            Contact No:
            <input
              id="ContactNumber"
              {...register("ContactNumber", {
                required: "Contact Number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit Contact Number",
                },
              })}
              className={`form-input ${errors.Fullname ? "error-input" : ""}`}
            />
          </label>
          {errors.ContactNumber && (
            <p className="error-message">{errors.ContactNumber.message}</p>
          )}
          <br />

          <label htmlFor="Gender" className="form-label">
            Gender:
            <div className="radio-label">
              <label>
                <input
                  type="radio"
                  value="Male"
                  {...register("Gender", { required: "Gender is required" })}
                  onChange={() => handleGenderChange("Male")}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  value="Female"
                  {...register("Gender", { required: "Gender is required" })}
                  onChange={() => handleGenderChange("Female")}
                />
                Female
              </label>
              <label>
                <input
                  type="radio"
                  value="Other"
                  {...register("Gender", { required: "Gender is required" })}
                  onChange={() => handleGenderChange("Other")}
                />
                Other
              </label>
            </div>
          </label>
          {errors.Gender && (
            <p className="error-message">{errors.Gender.message}</p>
          )}
          <br />

          <label htmlFor="DateOfBirth" className="form-label">
            DOB:
            <input
              id="DateOfBirth"
              type="date"
              {...register("DateOfBirth", {
                required: "Date of Birth is required",
              })}
              className={`form-input ${errors.Fullname ? "error-input" : ""}`}
            />
          </label>

          {errors.DateOfBirth && (
            <p className="error-message">{errors.DateOfBirth.message}</p>
          )}
          <br />
          <label htmlFor="City" className="form-label">
            City:
            <select
              id="City"
              {...register("City", {
                required: "City is required",
              })}
              className={`form-select ${errors.Fullname ? "error-input" : ""}`}
              defaultValue="" // Change selected to defaultValue
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="" disabled>
                Select City
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          {errors.City && (
            <p className="error-message">{errors.City.message}</p>
          )}
          <br />

          {/* Area dropdown */}
          <label htmlFor="Area" className="form-label">
            Area:
            <select
              id="Area"
              {...register("Area", {
                required: "Area is required",
              })}
              className={`form-select ${errors.Fullname ? "error-input" : ""}`}
              defaultValue="" // Change selected to defaultValue
            >
              <option value="" disabled>
                Select Area
              </option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
          {errors.Area && (
            <p className="error-message">{errors.Area.message}</p>
          )}
          <br />

          <label htmlFor="Password" className="form-label">
            Password:
            <input
              id="Password"
              {...register("Password", {
                required: "Password is required",
                minLength: {
                  value: 5,
                  message: "Password should have a minimum length of 5 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9!@#$%^&*]{6,16}$/,
                  message: "Invalid password format",
                },
              })}
              className={`form-input ${errors.Fullname ? "error-input" : ""}`}
              type="password"
            />
          </label>

          {errors.Password && (
            <p className="error-message">{errors.Password.message}</p>
          )}
          <br />

          <label htmlFor="ConfirmPassword" className="form-label">
            Confirm Password:
            <input
              id="ConfirmPassword"
              {...register("ConfirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`form-input ${errors.Fullname ? "error-input" : ""}`}
              type="password"
            />
          </label>
          {errors.ConfirmPassword && (
            <p className="error-message">{errors.ConfirmPassword.message}</p>
          )}
          <br />

          <Button type="submit" className="submit-button">
            SUBMIT
          </Button>
        </form>
      </Container>
      <div className="success-message">
        {successMessage && (
          <div>{successMessage}</div>
        )}
      </div>
    </div>
  );
}
