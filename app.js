const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const paymentRoute = require('./routes/paymentRoute');
const Razorpay = require('razorpay');
const Order = require('./models/Order'); 
const Pizza = require('./models/Pizza'); 
const User = require('./models/User');
require('dotenv').config();  
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const app = express();
const PORT = 8080;


mongoose.connect('mongodb://localhost:27017/pizzaDelivery')
    .then(() => {
        console.log('MongoDB connected successfully.');
        seedPizzas(); 
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

const seedPizzas = async () => {
    try {
        const pizzas = [
            { name: 'Margherita', price: 250, url : "https://th.bing.com/th/id/R.e46c5c06e3ee6883d8c73dcb276005d2?rik=S0j%2fJR6296uGBg&riu=http%3a%2f%2fexplo-re.com%2fwp-content%2fuploads%2f2017%2f09%2fPizza-Margherita.jpg&ehk=UZ9RE4a4My4%2fgh5nm2drYMq6pMhCaT45U6vJdl02K%2fU%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1" },
            { name: 'Pepperoni', price: 300,  url :"https://cdn.tasteatlas.com/images/dishes/b05a0af72ad845f3a6abe16143d7853a.jpg"},
            { name: 'BBQ Chicken', price: 350,url:"https://th.bing.com/th/id/OIP.7LCo_ses4uBZsdicXSkKIAHaLH?rs=1&pid=ImgDetMain" },
            { name: 'Vegetarian', price: 280 ,url:"https://lirp-cdn.multiscreensite.com/07572f03/dms3rep/multi/opt/AdobeStock_126451738-1920w.jpeg"},
            { name: 'Hawaiian', price: 320,url:"https://www.kayscleaneats.com/wp-content/uploads/2020/07/unadjustednonraw_thumb_a8b0.jpg" },
            {
                name:"customized pizza with base pizza ,sauce,chesse,and customized vegiees",
                price:200,
                type:"customized",
                Count:25
            }
        ];

        await Pizza.deleteMany();

        await Pizza.insertMany(pizzas);
        // console.log('Database seeded with sample pizzas.');
    } catch (error) {
        console.error('Error inserting pizza data:', error);
    }
};


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));


function isAdmin(req, res, next) {
    if (req.session.user && process.env.adminEmails.includes(req.session.user.email)) {
        next(); 
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
}





app.use('/', paymentRoute);


async function getPizzaById(id) {
    return await Pizza.findById(id);
}

app.get("/",(req,res)=>{
    res.render("Main");
})
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        req.session.cart = [];
        res.redirect('/home');
    } else {
        res.send('Invalid credentials');
    }
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const newUser = new User({ email, password });
    await newUser.save();
    res.redirect('/');
});

app.get('/home', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('home', { user: req.session.user });
});
app.get('/explore', async (req, res) => {
    try {
        const pizzas = await Pizza.find({ type: 'recommended' });
        res.render('explore', { pizzas });
    } catch (error) {
        console.error('Error fetching pizzas:', error);
        res.status(500).send('Server error');
    }
});


app.post('/addToCart', async (req, res) => {
    const cartItem = {};

    if (req.body.customPizza) {
        const veggies = Array.isArray(req.body.veggies) ? req.body.veggies : [req.body.veggies]; 
        cartItem.name = `${req.body.base} Base, ${req.body.sauce} Sauce, ${req.body.cheese} Cheese, ${veggies.join(', ')}`;
        cartItem.price = 200; 
        cartItem.quantity = 1; 
    } else {
        const pizzaId = req.body.pizzaId;
        const pizza = await getPizzaById(pizzaId);

        if (!pizza) {
            console.error('Pizza not found for ID:', pizzaId);
            return res.status(404).send('Pizza not found');
        }

        cartItem.name = pizza.name;
        cartItem.price = pizza.price;
        cartItem.quantity = 1; 
    }

    req.session.cart.push(cartItem);
    res.redirect('/cart'); 
});


app.get('/cart', (req, res) => {
    const cartItems = req.session.cart || [];
    res.render('cart', { cartItems });
});
app.get('/details', async(req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/cart'); 
    }
    const cartItems = req.session.cart;

    res.render('details', { cartItems});
});


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, 
    secure: false, 
    auth: {
      user: process.env.username, 
      pass: process.env.password, 
    },
  });

app.post('/details', async (req, res) => {
    const { address } = req.body;
    let amount1 = 0;

    try {
        
        for (let item of req.session.cart) {
            let pizza;
            let count=0;

            
            if (item.name.length > 20) {
                pizza = await Pizza.findOne({ type: 'customized' });
            } else {
                pizza = await Pizza.findOne({ name: item.name });
            }
            let msg=(pizza.type=="recommended")? `${pizza.name} stock is less than 20`:`Customized pizza Stock is less than 20 Check the Sauce ,Base Pizzza,Cheese,Vegiees`;
            if(pizza.Count<20){
                try {
                    const info = await transporter.sendMail({
                      from: '"Pizza Kitchen Store 👻" <pk6304144791@gmail.com>', 
                      to: "pk7386510581@gmail.com", 
                      subject: "Hello ✔", 
                      text: `${msg}`, 
                      html: `<b>Hello, ${msg}</b>`, 
                    });
                  } catch (error) {
                    console.error("Error sending email: ", error);
                    res.status(500).send("Error sending email");
                  }
            }

            if (pizza && pizza.Count > 0) {
                pizza.Count -= 1;
                await pizza.save(); 
            } else {
                console.error(`Pizza not found or count is 0 for item: ${item.name}`);
            }

            amount1 += item.price * (item.quantity || 1);
        }

        const order = new Order({
            userId: req.session.user._id,
            items: req.session.cart,
            address: address,
            orderStatus: 'Order Placed',
            amount: amount1, 
            payment: true,
            paymentId: null
        });

        await order.save();

        req.session.cart = [];

        // console.log('Order placed:', order);
        res.redirect('/home');  
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/myorders', async (req, res) => {
    const orders = await Order.find({ userId: req.session.user._id });
    
    res.render('myorders', { orders });
});

app.get('/myorders/:orderId', async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    // console.log(order);
    res.render('trackorder', { order });
});


app.get('/dashboard', isAdmin, (req, res) => {
    res.render('dashboard');
});

app.get('/dashboard/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find({ payment: true });
        res.render('adminOrders.ejs', { orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Server error');
    }
});


app.get('/dashboard/orders/:orderId', isAdmin, async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    res.render('adminOrderDetails', { order });
});

app.post('/dashboard/orders/:orderId', isAdmin, async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.orderId, { orderStatus: req.body.orderStatus });

        res.redirect('/dashboard/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Server error');
    }
});

app.get('/dashboard/items', isAdmin, async (req, res) => {
    const pizzas = await Pizza.find();
    res.render('adminItems', { pizzas });
});

app.post('/dashboard/items/:id', isAdmin, async (req, res) => {
    const { Count } = req.body; // Get the updated count from the form
    const pizzaId = req.params.id; // Get the pizza's ID from the URL

    try {
        await Pizza.findByIdAndUpdate(pizzaId, { Count: parseInt(Count, 10) });
        res.redirect('/dashboard/items'); // Redirect back to the items page
    } catch (error) {
        console.error("Error updating pizza count:", error);
        res.status(500).send("Internal Server Error");
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
