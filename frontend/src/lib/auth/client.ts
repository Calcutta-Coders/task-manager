'use client';
import axios from 'axios';


async function login(email: any, password: any) {
    try {
        const response = await axios.post('http://127.0.0.1:5500/api/auth/login', {
            email,
            password
        });
        // Handle successful login
        console.log('Login successful:', response.data);
        console.log(response.data)
        // Save the token to local storage or use it as needed
        localStorage.setItem('custom-auth-token', response.data.token);
    } catch (error:any) {
        if (error.response) {
            // Handle errors
            console.error('Login failed:', error.response.data.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// // Example usage
// login('user@example.com', 'password123');



async function signup(firstName: string, lastName: string, email: string, password: string, team: string, key: string) {
    try {
        const response = await axios.post('http://localhost:5500/api/auth/signup', {
            firstName,
            lastName,
            email,
            password,
            team,
            key
        }); 
        // Handle successful signup
        console.log('Signup successful:', response.data);
        // Save the token to local storage or use it as needed
        // localStorage.setItem('custom-auth-token', response.data.token);
        return
    } catch (error:any) {
        if (error.response) {
            // Handle errors
            console.error('Signup failed:', error.response.data.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}
// Example usage


import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  key: string,
  team: string
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    // Make API request
   


    // // We do not handle the API, so we'll just generate a token and store it in localStorage.
    // const token = generateToken();
    // localStorage.setItem('custom-auth-token', token);
    signup(params.firstName, params.lastName, params.email, params.password, params.team, params.key)

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;
    console.log(email, password)
    // Make API request
    login(email, password)

    // const token = generateToken();
    // localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');

    return {};
  }
}

export const authClient = new AuthClient();
