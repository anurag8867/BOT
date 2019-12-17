function validateEmail(emailField){
    var reg = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;

    if (reg.test(emailField) == false)
    {
        console.log('Invalid Email Address');
        return false;
    }

    return true;
}

console.log(validateEmail("25/08/1996"));
console.log(validateEmail("25-08-1996"));
console.log(validateEmail("25-08-19w96"));
console.log(validateEmail("25-08-1996"));