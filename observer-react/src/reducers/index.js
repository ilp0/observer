import {combineReducers} from 'redux'
import servers from './servercards'
import visibilityFilter from './visibilityfilter'

export default combineReducers({
	servers,
	visibilityFilter
})