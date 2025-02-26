import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import apiurl from "./Api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

const GOOGLE_CLIENT_ID = "59615837487-g4t36nt03t4ii6k878p7nvres0cs0tc1.apps.googleusercontent.com";

function GoogleAuthButton() {
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            console.log("Google Login Success:", credentialResponse);

            const res = await axios.post(`${apiurl}/auth/google`, {
                token: credentialResponse.credential, 
            });
            console.log("res", res);

            if (res.status === 200) {
                localStorage.setItem("loginToken", res.data.token);
                localStorage.setItem("userid", res.data.userid);
                navigate("/dashboard");
            }
        } catch (error) {
            console.log("Google Auth Error:", error);
            toast.error("Admin Approval is Pending. Kindly wait for the approval");
        }
    };

    const handleFailure = (error) => {
        console.error("Google Login Failed:", error);
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleFailure}
                ux_mode="popup"
                prompt="select_account"
                useOneTap={false} 
            />
        </GoogleOAuthProvider>
    );
}

export default GoogleAuthButton;
