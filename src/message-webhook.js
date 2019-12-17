const processMessage = require('./process-message'),
    usersRepo = require('../dbLayer/repositories/usersRepo'),
    messageRepo = require('../dbLayer/repositories/messageRepo');

module.exports = (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                console.log(event.sender.id, "event.sender.id");
                if (event && event.sender && event.sender.id) {
                    dbTask(event);
                }
            });
        });
        res.status(200).end();
    }
};

/*this function will start communication with Db for User as well as messages
* params event
* */
function dbTask(event) {
    usersRepo.get(event.sender, function (error, response) {
        if (error) {
            console.log("error while getting the user", error);
        } else {
            if (response) {
                // Our first goal is to get full required details of the user
                if (ifUserExistsWithCompleteDetails(event, response)) {
                    messageRepo.post({
                        "message": event.message.text || "",
                        "senderId": event.sender.id
                    }, function (error, response) {
                        if (error) {
                            console.log("error while saving message", error);
                        } else {
                            console.log("message saved succesfully");
                        }
                    });
                    processMessage(event);
                }
            } else {
                usersRepo.post({
                    "id": event.sender.id
                }, function (error, response) {
                    if (error) {
                        console.log("error while saving the user", error);
                    } else {
                        console.log("user saved with sender Id succesfully");
                    }
                });
                processMessage(event, "Tell me your name starting by @name-");
            }
        }
    });
}

/*this function will check which property is yet missign from the user detail
* params event
* params details
* return Boolean
* */
function ifUserExistsWithCompleteDetails(event, details) {
    if (isAllDetailsAvailable(details)) {
        return true;
    } else {
        let key = getKeyDetail(event.message.text, event);
        if (key) {
            anyDetailInMsg(event.message.text, event.sender.id, event);
            let copyDetail = JSON.parse(JSON.stringify(details));
            copyDetail[key.key] = key.value;
            //Check which required property of user is required from the user
            if (!copyDetail.email) {
                processMessage(event, "Tell me your email Id starting by @email-");
            } else if (!copyDetail.pwd) {
                processMessage(event, "Tell me your pwd starting by @pwd-");
            } else if (!copyDetail.DOB) {
                processMessage(event, "Tell me your DOB starting by @DOB-");
            } else {
                return true;
            }
        }
    }
}

/*this function will check the availability of some properties with the response from the Db
* params response
* return Boolean
* */
function isAllDetailsAvailable(response) {
    return response.name && response.email && response.pwd && response.DOB;
}

/*this function will update the detail of the user until all the required fields start existing in Db
* params text
* params id
* params event
* return Boolean
* */
function anyDetailInMsg(text, id, event) {
    let keyDetail = getKeyDetail(text, event);
    // detail Exist In Message then update the object available in database
    if (keyDetail) {
        let keyName = keyDetail.key, value = keyDetail.value;
        let upobj = {};
        upobj[keyName] = value;
        usersRepo.put({
            "id": id
        }, {$set: upobj}, {upsert: true}, function (error, response) {
            if (error) {
                console.log("error while updating the user", error);
            } else {
                console.log("users " + keyName + " updated succesfully");
            }
        });
        return true;
    } else {
        return false;
    }
}

/*this function will fetch the properties and values coming with the text messages from user
* params text
* return Object or boolean
* */
function getKeyDetail(text, event) {
    let keyDetail;
    if (!text.search("@name-")) {
        keydetail = {key: "name", value: text.substring(6)};
        return validateProp(keydetail, event);
    } else if (!text.search("@email-")) {
        keydetail = {key: "email", value: text.substring(7)};
        return validateProp(keydetail, event);
    } else if (!text.search("@pwd-")) {
        keydetail = {key: "pwd", value: text.substring(5)};
        return validateProp(keydetail, event);
    } else if (!text.search("@DOB-")) {
        keydetail = {key: "DOB", value: text.substring(5)};
        return validateProp(keydetail, event);
    } else {
        return false;
    }
}

/*this function will validate the properties
* params text
* return Boolean
* */
function validateProp(keyDetail, event) {
    if (keyDetail.key === "name") {
        if (keyDetail.value.length < 5) {
            console.log('Invalid Name');
            processMessage(event, "Name must have 6 or more character starting by @name-");
            return false;
        }
        return keyDetail;
    } else if (keyDetail.key === "email") {
        let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test(keyDetail.value) == false) {
            console.log('Invalid Email Address');
            processMessage(event, "Invalid Email Id please try again starting by @email-");
            return false;
        }
        return keyDetail;
    } else if (keyDetail.key === "pwd") {
        let reg = /^[A-Za-z]\w{5,14}$/;

        if (reg.test(keyDetail.value) == false) {
            console.log('Invalid Password');
            processMessage(event, "Invalid Pwd minimum 5 characters required starting by @pwd-");
            return false;
        }
        return keyDetail;
    } else if (keyDetail.key === "DOB") {
        let reg = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;

        if (reg.test(keyDetail.value) == false) {
            console.log('Invalid DOB');
            processMessage(event, "Invalid DOB, Please try again starting by @DOB-");
            return false;
        }
        return keyDetail;

    }
}