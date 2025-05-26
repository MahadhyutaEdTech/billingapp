//Validation function for Name...
export const validateName = (name) => {
    if (!name || name.trim() === "") return false; 
    const nameRegex = /^[a-zA-Z\s]+$/; 
    return nameRegex.test(name);
  };
  //Validation function for Email...
  export const validateEmail = (email) => {
    if (!email || email.trim() === "") return false; 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
    return emailRegex.test(email);
  };