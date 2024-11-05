import React, { useEffect, useState } from 'react';
import { FormData } from './FormData';
import { fields } from './fields';
import { generateParkingCode } from './generateParkingCode';
import { getCurrencySymbol } from './getCurrencySymbol';
import './App.css';
import './input-container.css';
import './dateInput.css';
import './dropdown.css';
import './tooltip-container.css';

const App: React.FC = () => {
  const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    phone: "",
    carModel: "",
    licensePlate: "",
    startDateTime: "",
    endDateTime: "",
    discountPercentage: "",
    currency: "USD",
  };

  const [data, setData] = useState<FormData>(initialFormData);
  const [allData, setAllData] = useState<FormData[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setData((prev) => ({ 
      ...prev, 
      [name]: name === "discountPercentage" ? (value ? parseFloat(value).toString() : "0") : value,
    }));
  };

  useEffect(() => {
    calculateTotalCost();
  }, [data.discountPercentage, data.startDateTime, data.endDateTime, selectedCurrency]);

  const calculateTotalCost = async () => {
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers:  {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDateTime: data.startDateTime,
          endDateTime: data.endDateTime,
          discountPercentage: data.discountPercentage,
          currency: selectedCurrency,
          paymentDate: new Date().toISOString().split("T")[0],
        }),
      });

      if(response.ok) {
        const { totalCost: costInSelecteedCurrency } = await response.json();
        setTotalCost(costInSelecteedCurrency);
      } else {
        console.error("Error calculating total cost.");
      }
    } catch(error) {
      console.error("Error:", error);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const newCurrency = e.target.value
    setSelectedCurrency(newCurrency);

    setData(prev => ({ ...prev, currency: newCurrency }));
    calculateTotalCost();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculateTotalCost();
    const parkingCode = generateParkingCode();
    try {
      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          parkingArea: parkingCode,
          totalCost,
          currency: selectedCurrency,
        }),
      });
      if (response.ok) {
        setData(initialFormData);
        setTotalCost(0);
      } else {
        console.error("Error saving data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGetData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await fetch("/api/data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            const data = await response.json();
            setAllData(data);
            setSelectedCurrency(data[0].currency);
        } else {
            console.error("Error retrieving data");
        }
    } catch (error) {
        console.error("Error:", error);
    }
  };

  const handleEdit = (index: number) => {
    const itemToEdit = allData[index];
    if (itemToEdit) {
      setData(itemToEdit);
      setSelectedCurrency(itemToEdit.currency || "USD");
      calculateTotalCost();
    }
  };

  const handleUpdate = async () => {
    await calculateTotalCost();

    try {
        const response = await fetch(`/api/data/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...data,
                parkingArea: data.parkingArea,
                totalCost,
                currency: selectedCurrency,
            }),
        });

        if (response.ok) {            
            setAllData((prevData) =>
                prevData.map((item) =>
                    item.id === data.id ? {...item, ...data, totalCost } : item
                )
            );
            setData(initialFormData);
        } else {
            console.error("Error updating data");
        }
    } catch (error) {
        console.error("Error:", error);
    }
  };

  const handleDelete = async (index: number) => {
    const itemToDelete = allData[index];

    try {
      const response = await fetch(`/api/data/${itemToDelete.id}`, {
          method: "DELETE",
      });
      if (response.ok) {
          setAllData((prevData) => prevData.filter((_, i) => i !== index));
      } else {
          console.error("Error deleting data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className='main-container'>
      <div className='left-container'>
          {fields.map((field) => (
            <div 
              key={field.name}
              className='container'
            >
              <input
              type='text'
              id={field.name}
              name={field.name}
              value={data[field.name as keyof FormData]}
              onChange={handleChange}
              className="input"
              required
              />
              <label 
                htmlFor={field.name}
                className='label'
              >
                {field.label}
              </label>
            </div>
          ))}
        <form onSubmit={handleSubmit}>
        <div className='container'>
            <input 
              type='number'
              name='discountPercentage'
              value={data.discountPercentage}
              className="input"
              min={0}
              max={100}
              onChange={handleChange}
            />
            <label className='label'>Discount Percentage:</label>
            <span className="error-message">Value cannot exceed 100%</span>
          </div>
          <div id="dateDiv">
            <label>Start Date and Time:</label>
            <input
              type='datetime-local'
              name='startDateTime'
              value={data.startDateTime}
              onChange={handleChange}
              id="dateInput"
              className="dateInput"
              required
              placeholder="Date:  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMYYYY"
            />
            <label>End Date and Time:</label>
            <input
              type='datetime-local'
              name='endDateTime'
              value={data.endDateTime}
              onChange={handleChange}
              required
              onBlur={calculateTotalCost}
              id="dateInput"
              className="dateInput"
              placeholder="Date:  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MMYYYY"
            />
          </div>
          <label>Select Currency: </label>
          <select 
            value={selectedCurrency} 
            onChange={handleCurrencyChange}
            className="dropdown-list"
          >
            <option className="dropdown-list-item" value="USD">USD</option>
            <option className="dropdown-list-item" value="EUR">EUR</option>
            <option className="dropdown-list-item" value="PLN">PLN</option>
          </select>
          <h2>Total Cost {getCurrencySymbol(selectedCurrency)}: {totalCost.toFixed(2)}</h2>
          <button type='submit'>
            <span className="box">
              Submit
            </span>
          </button>
          <button type='button' onClick={handleGetData}>
            <span className="box">
              GET
            </span>
          </button>
          {data.id && (
            <button type='button' onClick={handleUpdate}>Update</button>
          )}
        </form>
      </div>
      <div className='right-container'>
        <h2>Received Data</h2>
        <ul>
          {allData.map((item, index) => (
            <li key={item.id}>
              <strong>Name:</strong> {item.firstName} {item.lastName}<br />
              <strong>Phone:</strong> {item.phone}<br />
              <strong>Car Model:</strong> {item.carModel}<br />
              <strong>License Plate:</strong> {item.licensePlate}<br />
              <strong>Parking Area:</strong> {item.parkingArea}<br />
              <strong>Total Cost</strong> {getCurrencySymbol(item.currency || "")}: {item.totalCost?.toFixed(2)}<br />
              <strong>Start Date and Time:</strong> {item.startDateTime.replace("T", " from ")}<br />
              <strong>End Date and Time:</strong> {item.endDateTime.replace("T", " to ")}<br />
              <button type='button' onClick={() => handleEdit(index)}>Edit</button>
              <button type='button' onClick={() => handleDelete(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
