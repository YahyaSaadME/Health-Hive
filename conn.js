const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@textapps.er1hajy.mongodb.net/hacksummit?retryWrites=true&w=majority&appName=TextApps/healthhive`)

    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));