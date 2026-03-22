import React, { useState } from "react";
import axios from "axios";

const RequestBlood = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    unitsRequired: 1,
    hospitalName: "",
    hospitalStreet: "",
    hospitalCity: "",
    hospitalState: "",
    pincode: "",
    contactName: "",
    contactPhone: "",
    urgency: "Medium",
    notes: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/blood/request", {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        unitsRequired: formData.unitsRequired,
        hospitalName: formData.hospitalName,
        hospitalAddress: {
          street: formData.hospitalStreet,
          city: formData.hospitalCity,
          state: formData.hospitalState,
          pincode: formData.pincode
        },
        contactPerson: {
          name: formData.contactName,
          phone: formData.contactPhone
        },
        urgency: formData.urgency,
        notes: formData.notes
      });

      alert("Blood request submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit blood request");
    }
  };

  return (
    <div>
      <h2>Request Blood</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          onChange={handleChange}
          required
        />

        <select name="bloodGroup" onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <input
          type="number"
          name="unitsRequired"
          min="1"
          max="10"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="hospitalName"
          placeholder="Hospital Name"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="hospitalStreet"
          placeholder="Hospital Street"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="hospitalCity"
          placeholder="City"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="hospitalState"
          placeholder="State"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="contactName"
          placeholder="Contact Person Name"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="contactPhone"
          placeholder="Contact Phone"
          onChange={handleChange}
          required
        />

        <select name="urgency" onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <textarea
          name="notes"
          placeholder="Additional Notes"
          onChange={handleChange}
        />

        <button type="submit">Submit Blood Request</button>
      </form>
    </div>
  );
};

export default RequestBlood;
