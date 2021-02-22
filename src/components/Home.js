import React from 'react'
import {cardsRef} from '../firebase'
import {AuthConsumer} from './AuthContext'

import firebase from 'firebase/app';
import 'firebase/firestore';

class Home extends React.Component {
    frontsideInput = React.createRef()
    backsideInput = React.createRef()
    state ={
        cardStacks: [],
        stackIds: [],
        currentStack: '',
        currentStackName: '',
        currentCards: [],
        user: this.props.user,
        current: 0,
        flipped: false,
        showCreateCard: false,
        frontside: '',
        backside: '',
        editingCard: false
    }
    componentDidMount(){
        this.fetchCardStacks(this.props.user)
    }
    createCardStack() {
        const name = prompt ("Enter a name for the card stack", "Card Stack");
        //console.log(name)
        if (name!==null) {
        const stack = {
            name: name,
            createdBy: this.state.user,
        }
        const cards = []
        cardsRef.add({stack,cards})
    }
    this.setState({cardStacks: [], stackIds: []})
    this.fetchCardStacks(this.props.user)
    }
    fetchCardStacks = async user => {
        try {
        const stacks = await cardsRef
        .where('stack.createdBy', '==', user)
        .get()
        stacks.forEach(doc => {
            this.setState({cardStacks: [...this.state.cardStacks, doc.data().stack.name], stackIds: [...this.state.stackIds, doc.id]})
        })
        //console.log(this.state.cardStacks)
        //console.log(this.state.stackIds)
    } catch(error) {
        console.log(error)
    }
    }
    shuffleCardStack() {
        let stackSize = this.state.currentCards.length;
        while (0 !== stackSize) {
            let randomCard = Math.floor(Math.random() * stackSize);
            stackSize -= 1;
            let temp = this.state.currentCards[stackSize];
            this.state.currentCards[stackSize] = this.state.currentCards[randomCard];
            this.state.currentCards[randomCard] = temp;
        }
        this.setState({current: 0})
        //console.log(this.state.currentCards)
    }
    deleteCardStack = async () => {
        if(window.confirm("Are you sure you want to delete the currently selected card stack?")) {
            try {
                const stack = await cardsRef.doc(this.state.currentStack)
                this.setState({currentStack: '', currentCards: [], current: 0, stackIds: [...this.state.stackIds.filter(stack => {
                    return stack.id !== this.state.currentStack
                })], cardStacks: [...this.state.cardStacks.filter(stack => {
                    return stack !== this.state.currentStackName
                })]
            })
            stack.delete()
            } catch(error) {
                console.log(error)
            }
        }

    }
    createCard() {
        //e.preventDefault();
        try {
        const card = {
            frontside: this.frontsideInput.current.value,
            backside: this.backsideInput.current.value
        }
        cardsRef.doc(this.state.currentStack).update({
            cards: firebase.firestore.FieldValue.arrayUnion(card)
        })
        this.setState({currentCards: []})
        this.fetchCards();
    } catch(error){
        console.log(error)
    }
    }
    fetchCards = async () => {
        this.setState({current: 0})
        //console.log(this.state.current)
        try {
            const cards = await cardsRef
            .get()
            cards.forEach(doc => {
                if (doc.id === this.state.currentStack) {
                    //console.log(doc.data().cards)
                    this.setState({currentCards: doc.data().cards})
                    //console.log(this.state.currentCards)
                }
            })
        } catch(error) {
            console.log(error)
        }
    }
    
    editCard = async () => {
        try {
            const cards = await cardsRef
            .get()
            cards.forEach(doc => {
                if (doc.id === this.state.currentStack) {
                    //console.log(docs.data().cards)
                    doc.data().cards.forEach((card,index) => {
                        if(index === this.state.current) {
                            //console.log(index + ' ' + card.frontside + ' ' + card.backside)
                            //console.log(doc.data().cards[index])
                            const stackRef = cardsRef.doc(doc.id)
                            const tempStore = doc.data().cards
                            //console.log(tempStore)
                            tempStore[index].frontside = this.frontsideInput.current.value
                            tempStore[index].backside = this.backsideInput.current.value
                            //console.log(tempStore[index])
                            stackRef.update({cards: [...tempStore]})
                        }
                    })
                }
            })
            this.fetchCards()
        } catch(error) {
            console.log(error)
        }
    }

    deleteCard = async () => {
        try {
            const cards = await cardsRef
            .get()
            cards.forEach(doc => {
                //console.log(doc.id)
                if (doc.id === this.state.currentStack) {
                    doc.data().cards.forEach((card,index) => {
                        if (index === this.state.current) {
                            const stackRef = cardsRef.doc(doc.id)
                            let tempStore = doc.data().cards
                            delete tempStore[index]
                            let filteredTemp = []
                            for(let i of tempStore) {
                                i && filteredTemp.push(i)
                            }
                            tempStore = filteredTemp
                            stackRef.update({cards: [...tempStore]})
                        }
                    })
                }
            })
            this.fetchCards()
        } catch(error) {
            console.log(error)
        }
    }
    render() {
        return (
            <AuthConsumer>
                {({logOut}) => (
                    <>
                    <div className="bg-gray-600 h-screen w-screen">
                    <div className="bg-purple-500 h-12 w-full py-3 px-2">
                        <button className="bg-white w-1/4 border box-border border-black"onClick={(e) => logOut()}>Log Out</button>
                        <button className="bg-white w-1/4 border box-border border-black"onClick={(e) => this.createCardStack()}>Create Card Stack</button>
                        <button className="bg-white w-1/4 border box-border border-black"onClick={(e) => this.shuffleCardStack()}>Shuffle Card Stack</button>
                        <button className="bg-white w-1/4 border box-border border-black"onClick={(e) => this.deleteCardStack()}>Delete Card Stack</button>
                    </div> 
                    <div className="bg-white h-12 w-full py-3 px-2">
                    {Object.keys(this.state.cardStacks).map(key =>
                        <span key={key}>
                            <button onClick={(e) => {this.setState({currentStack: this.state.stackIds[key], currentStackName: this.state.cardStacks[key]}); this.fetchCards()}} className="bg-purple-500 border box-border border-black">{this.state.cardStacks[key]}</button>
                        </span>
                        )}
                    </div>  
                        {this.state.currentStack !== '' ? 
                        <>
                        <div className="text-center py-3 bg-gray-600">
                        {Object.keys(this.state.currentCards).map(key => 
                            <div key={key}>
                                {key == this.state.current ?  
                                <div className="py-52 text-4xl bg-purple-500"> 
                                {this.state.currentStackName}
                                <br/>
                                {(this.state.current > 0) ? <><button onClick={(e) => this.setState({current: this.state.current-=1})} className="mr-10">&#8592;</button></> : <></>}
                                {this.state.flipped === false ? <>{this.state.currentCards[this.state.current].frontside}</> : <>{this.state.currentCards[this.state.current].backside}</>}
                                {(this.state.current != this.state.currentCards.length-1) ? <><button onClick={(e) => this.setState({current: this.state.current+=1})} className="ml-10">&#8594;</button> </> : <></>}
                                <br/>
                                <button onClick={(e) => this.setState({flipped: !this.state.flipped})}>&#9735;</button>
                                <br/>
                                <button onClick={(e) => this.setState({frontside: this.state.currentCards[this.state.current].frontside, backside: this.state.currentCards[this.state.current].backside, editingCard: !this.state.editingCard, showCreateCard: !this.state.showCreateCard})}>Edit Card</button>
                                &nbsp;
                                <button onClick={(e) => this.deleteCard()}>Delete Card</button>
                                </div>
                                : <></>}
                            
                            </div>
                            )}
                         </div>
                        <div className="bg-gray-600">
                        <div className="text-center"><button onClick={(e) => this.setState({showCreateCard: !this.state.showCreateCard, frontside: '', backside: ''})} className="bg-white border box-border border-black">Show/Hide Create Card</button></div>
                        
                        {this.state.showCreateCard ? 
                        <>
                        
                        <div className="text-center pt-2">
                        <span className="px-5"><textarea ref={this.frontsideInput}  placeholder='Enter the information for the frontside of the card' rows='10' cols='40' className="resize-none" defaultValue={this.state.frontside}/></span>
                        <span className="px-5"><textarea ref={this.backsideInput}  placeholder='Enter the information for the backside of the card' rows='10' cols='40' className="resize-none" defaultValue={this.state.backside}/></span>
                        {this.state.editingCard ? 
                        <><div className="text-center pt-1"><button onClick={(e) => this.editCard()}className="bg-white border box-border border-black">Edit Card</button>
                        </div>
                        </> : 
                        <>
                        <div className="text-center pt-1"><button onClick={(e) => this.createCard()} className="bg-white border box-border border-black">Create Card</button>
                        </div>
                        </>}
                        </div>
                        </> : <></>
                        }
                        </div>
                        </>
                        : <></>
                        }
                        </div>
                    </>
                )}
            </AuthConsumer>
        )
    }


}

export default Home