import {connect} from 'react-redux'
import ServerCardContainer from './ServerCardContainer.js'

const getVisibleServerCards = (cards) => {
	
	return cards;
}

const mapStateToProps = state => ({
	cards: getVisibleServerCards(state.cards)
})

//const mapDispatchToProps = dispatch => ({
//	return null;
//})

export default connect(mapStateToProps)(ServerCardContainer)