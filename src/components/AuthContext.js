import React from 'react'
import { firebaseAuth } from '../firebase'
import {withRouter} from 'react-router-dom' 

const AuthContext = React.createContext()

class AuthProvider extends React.Component {
    state = {
        user: {},
        authMessage: ''
    }

    componentDidMount() {
        firebaseAuth.onAuthStateChanged((user) => {
            if(user) {
                this.setState({
                    user: {
                        id: user.uid,
                        email: user.email
                    }
                })
            } else {
                this.setState({
                    user: {}
                })
            }
        })
    }
    
    signUp = async (email, password, e) => {
        try {
            e.preventDefault()
            await firebaseAuth.createUserWithEmailAndPassword(
                email,
                password
            )

        } catch(error) {
            this.setState({
                authMessage: error.message
            })
        }
    }
    logIn = async (email, password, e) => {
        try {
            e.preventDefault()
            await firebaseAuth.signInWithEmailAndPassword(
                email,
                password
            )
            
        } catch(error) {
            this.setState({
                authMessage: error.message
            })
        }
    }
    logOut = () => {
        try {
            firebaseAuth.signOut()
            this.setState ({
                user: {}
            })
            this.props.history.push(`/`)
            //console.log('signed out')
        } catch(error) {
            this.setState({
                authMessage: error.messages
            })
        }
    }
    
    render () {
        return (
            <AuthContext.Provider
            value = {{ 
                user: this.state.user, 
                signUp: this.signUp,
                logIn: this.logIn,
                logOut: this.logOut,
                authMessage: this.state.authMessage
                }}>
                {this.props.children}
            </AuthContext.Provider>
        )
    }
}

const AuthConsumer = AuthContext.Consumer
export default withRouter(AuthProvider)
export { AuthConsumer}