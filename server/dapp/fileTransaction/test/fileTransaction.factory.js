
const factory = {
  createConstructorArgs(uid) {
    const args = {
      fileTransactionId: uid,
      externalStorageAddress: '',
      category: '',
      access:'',
      fileName: '',
    }
    return args
  },
  createDetailsArgs(uid) {
    const args = {
      dateTime: '',
      uploadedBy: '',
      uploadedTo: '',
      acceptedBy: '',
      verified: '',
    }
    return args
  },
}

export default factory
