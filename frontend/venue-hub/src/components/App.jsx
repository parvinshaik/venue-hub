import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import apiurl from "./Api";

function App() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("tab1");
    const [text, setText] = useState("");
    const fullText = "A  Streamlined Venue Booking and Management System";
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });
    const [registerData, setRegisterData] = useState({
        name: "",
        rollNumber: "",
        email: "",
        password: "",
        termsAccepted: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        let index = 0; 
        const interval = setInterval(() => {
            if (index < fullText.length) {
                setText((prev) => prev + fullText.charAt(index)); 
                index++; 
            } else {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRegisterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRegisterData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiurl}/login`, loginData);
            if (response.data) {
                await localStorage.setItem("loginToken", response.data.token);
                console.log(response.data);
            }

            if (response.data.token && response.data.approved_user === true) {
                toast.success("Login successful!");
                navigate("/dashboard");
            }
            else if (response.data.token){
                toast.error("Admin Approval is Pending. Kindly wait for the approval");
            }

        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
        }
    };
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!registerData.termsAccepted) {
            toast.error("You must accept the terms to register.");
            return;
        }

        try {
            const data = {
                name: registerData.name,
                email: registerData.email,
                roll: registerData.rollNumber,
                password: registerData.password
            }
            const response = await axios.post(`${apiurl}/register`, data);

            console.log(response.data);
            if (response.data) {
                toast.success("Registration successful! Kindly wait for Admin Approval.");
            }

        } catch (error) {
            console.log(error)
            toast.error("Registration failed. Please try again.");
        }
    };

    return (
        <div className=" w-full h-screen bg-gradient-to-r from-[#6a11cb] to-[#2575fc] ">
            <ToastContainer />
            <div className="max-h-screen flex flex-col items-center justify-center ">

                <div className="flex flex-col w-[50%] mr-10 t-0 my-20">
                    <h3 className="text-white text-4xl font-bold text-center mb-4">Venue Hub</h3>
                    <h1 className="text-white text-2xl font-bold text-center">{text}</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                    <div className="flex justify-between border-b border-gray-300 mb-6">
                        <button
                            onClick={() => setActiveTab("tab1")}
                            className={`w-1/2 text-center py-2 ${activeTab === "tab1" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setActiveTab("tab2")}
                            className={`w-1/2 text-center py-2 ${activeTab === "tab2" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                        >
                            Register
                        </button>
                    </div>

                    <div>
                        {activeTab === "tab1" && (
                            <form onSubmit={handleLoginSubmit}>
                                <div>
                                    <input required
                                        type="email"
                                        name="email"
                                        value={loginData.email}
                                        onChange={handleLoginChange}
                                        placeholder="Email address"
                                        className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input required
                                        type="password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        placeholder="Password"
                                        className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="flex items-center">
                                            <input required type="checkbox" className="mr-2" />
                                            Remember me
                                        </label>
                                        <a href="#!" className="text-sm text-blue-500">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
                                        Sign in
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "tab2" && (
                            <form onSubmit={handleRegisterSubmit}>
                                <div>
                                    <input required
                                        type="text"
                                        name="name"
                                        value={registerData.name}
                                        onChange={handleRegisterChange}
                                        placeholder="Name"
                                        className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input required
                                        type="text"
                                        name="rollNumber"
                                        value={registerData.rollNumber}
                                        onChange={handleRegisterChange}
                                        placeholder="Roll Number"
                                        className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input required
                                        type="email"
                                        name="email"
                                        value={registerData.email}
                                        onChange={handleRegisterChange}
                                        placeholder="Email"
                                        className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input required
                                        type="password"
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        placeholder="Password"
                                        className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center mb-4">
                                        <input required
                                            type="checkbox"
                                            name="termsAccepted"
                                            checked={registerData.termsAccepted}
                                            onChange={handleRegisterChange}
                                            className="mr-2"
                                        />
                                        <label>I have read and agree to the terms</label>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
                                        Sign up
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
