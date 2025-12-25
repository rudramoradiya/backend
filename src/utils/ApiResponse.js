// this file give  the formate of the response 
class ApiResponse{
    constructor(  
        statuscode,
        data,
        message="success"){
            this.statuscode=statuscode
            this.data=data
            this.message=message
            this.success=statuscode<400  //because it is the response
        }

}

export {ApiResponse}

// now we have to do that when we have the error it must be passing throw the apierror