mongoose.connect(`${config.get("MONGODB_URI")}/scatchh`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

module.exports = mongoose.connection;
