const userDal = require('../dals/users/userDal');

exports.validUser = async (loginUser) => {
    try {
        let userName = loginUser.userName;
        let pwd = loginUser.password;
        let userData = await userDal.readFile();
        let users = userData.users

        let userExists = users.filter(user => (user.userName == userName) && (user.password == pwd));
        return userExists[0];
    } catch(err) {
        throw(err);
    }  
}

exports.validUserCredit = (counter,loginDate,numOfTransaction,isAdmin) => {
    try{
        let checkDate = new Date();
        let checkMon = checkDate.getMonth() +1;

        //return after stop debuging
        if(isAdmin) return "Success";

        if(counter > numOfTransaction && 
            (loginDate <= (checkDate.getDate() + "/" + checkMon + "/" + checkDate.getFullYear()))) {
                return "Fail";
        } else {
            return "Success";
        }
    } catch(err) {
        throw(err);
    } 
}

exports.getUsersData = async () => {
    try{
        let users = await userDal.readFile();
        return users

    }catch(err){
        throw(err)
    }
}

exports.getUsersDataById = async (userId) => {
    try{
        let data = await userDal.readFile();
        let users = data.users;

        let user = users.filter(u => u.id == userId)
        return user[0];

    }catch(err){
        throw(err)
    }
}

exports.updateUser = async (newUser) => {
    try {
        let usersData = await userDal.readFile();

        let users = usersData.users;
        if(newUser){
            let index = users.findIndex(u => u.id == newUser.id);
            if(index > -1) {
                let _Users = [...users]
                _Users[index] = {..._Users[index],
                                userName:newUser.userName,
                                password:newUser.password};
                usersData = {...usersData,users:_Users}
                let res = await userDal.writeFile("users.json",usersData)

                return res;
            } else {
                return "User Not Found";
            }
            
        }
    } catch(err){
        throw(err)
    }
}

exports.deleteUser = async (userId) => {
    try {
        let usersData = await userDal.readFile();
        let users = usersData.users;
        let _users = [...users]
        let index = users.findIndex(u => u.id == userId);
        if(index > -1) {
            _users.splice(index,1);
            usersData = {...usersData,users:_users};

            let res = await userDal.writeFile("users.json",usersData)
            return res;

        } else {
            return "User Not Found";
        }
        
    } catch(err) {
        throw(err)
    }
}

exports.addNewUser = async (newUser) => {
    try {
        let usersData = await userDal.readFile();
        let users = usersData.users;

        if(newUser){
            let maxId = users.reduce((max, user) => (user.id > max ? user.id : max),users[0].id);
            newUser.numOfTransaction = parseInt(newUser.numOfTransaction);

            maxId += 1;
            users.push({...newUser,id:maxId,isAdmin:false});
            usersData = {...usersData,users:users}
            let res = await userDal.writeFile("users.json",usersData);

            return res;
        }

    } catch(err){
        throw(err)
    }
}

exports.restartSession = (appSession) => {
    try {
        appSession.counter = 1;
        let logDate = new Date();
        let mon = logDate.getMonth() +1;
        appSession.loginDate = logDate.getDate() + "/" + mon + "/" + logDate.getFullYear();

        return appSession;
    } catch(err) {
        throw(err);
    }
}