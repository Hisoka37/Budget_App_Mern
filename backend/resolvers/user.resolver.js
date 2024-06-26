import User from '../models/user.model.js'
import Transaction from '../models/transaction.model.js'
import bcrypt from 'bcryptjs'

const userResolver = {
    Mutation: {
        signUp: async (_, { input }, context) => {
            try {
                const { username, name, password, gender } = input;

                if (!username || !name ||  !password || !gender) {
                    throw new Error('All fields are required')
                }
                const existingUser = await User.findOne({ username })
                if (existingUser) {
                    throw new Error("Username already exist")
                }

                const salt = await bcrypt.genSalt(10)
                const hashedPass = await bcrypt.hash(password, salt)

                const maleProfile = `https://avatar.iran.liara.run/public/boy?username=${username}`
                const femaleProfile = `https://avatar.iran.liara.run/public/girl?username=${username}`

                const newUser = new User({
                    username,
                    name,
                    password: hashedPass,
                    gender,
                    profilePicture: gender === "male" ? maleProfile : femaleProfile,
                })
                await newUser.save();
                await context.login(newUser)
                return newUser;
            } catch (error) {
                console.error("Error in signUp: ", error)
                throw new Error(error.message || "Internal Server Error")
            }
        },
        login: async (_, {input}, context) => {
            try {
                const { username, password } = input
                if (!username  || !password) {
                    throw new Error("Please fill in all fields ")
                }
                const { user } = await context.authenticate("graphql-local", { username, password })
                await context.login(user)
                return user
            } catch (error) {
                console.error("Error in Login: ", error)
                throw new Error(error.message || "Internal Server Error")
            }
        },
        logout: async (_, __,context) => {
            try {
                await context.logout();
                context.req.session.destroy((err) => {
                    if (err) throw err
                })

                context.res.clearCookie("connect.sid");
                return { message: "Logged Out Successfully" }

            } catch (error) {
                console.error("Error in logout: ", error)
                throw new Error(error.message || "Internal Server Error")
            }
        }
    },
    Query: {
        authUser: async (_, __, context) => {
            try {
                const user = await context.getUser();
                return user;
            } catch (error) {
                console.error("Error in authUser: ", err);
                throw new Error(error.message || "Internal Server Error")
            }
        },

        user: async (_, { userId }) => {
            try {
                const user = await User.findById(userId)
                return user;
            } catch (error) {
                console.error("Error in user query: ", error)
                throw new Error(error.message || "Internal Server Error")
            }
        }
    },
    User: {
        transactions: async (parent) => {
            try {
                const transactions = await Transaction.find({userId: parent._id})
                return transactions;
            } catch (error) {
                console.log("Error in user transaction resolver:" , error)
            }
        }
    }
};


export default userResolver