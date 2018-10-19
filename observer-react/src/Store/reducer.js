//init state
const initialState = {
	id: 0,
	ip: 0,
	cpu_us: 0,
	mem_us: 0,
	mem_tot: 0	
};
//päivittää staten
const reducer = (state = initialState, action) =>{
	//new state
	switch (action) {
		case 'UPDATE_CARD':
			return Object.assign({}, state, {
				id: action.id,
				ip: action.ip,
				cpu_us: action.cpu_us,
				mem_us: action.mem_us,
				mem_tot: action.mem_tot	
			})
		default:
			return state;
	}
}

export default reducer;