export const GET_FILE_REQUEST = 'GET_FILE_REQUEST';
export const GET_FILE_SUCCESS = 'GET_FILE_SUCCESS';
export const GET_FILE_FAILURE = 'GET_FILE_FAILURE';
export const UPLOAD_FILE_REQUEST = 'UPLOAD_FILE_REQUEST';
export const UPLOAD_FILE_SUCCESS = 'UPLOAD_FILE_SUCCESS';
export const UPLOAD_FILE_FAILURE = 'UPLOAD_FILE_FAILURE';


export const getFile = () => {
    return {
        type: GET_FILE_REQUEST
    }
}

export const getFileSuccess = (file) => {
    return {
        type: GET_FILE_SUCCESS,
        file
    }
}

export const getFileFailure = (error) => {
    return {
        type: GET_FILE_FAILURE,
        error
    }
}

export const uploadFile = (file) => {
    return {
        type: UPLOAD_FILE_REQUEST,
            file
    }
}

export const uploadFileSuccess = () => {
    return {
        type: UPLOAD_FILE_SUCCESS
    }
}

export const uploadFileFailure = (error) => {
    return {
        type: UPLOAD_FILE_FAILURE,
        error
    }
}
