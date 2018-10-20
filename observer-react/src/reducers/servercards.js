const servers = (state = [], action) => {
	switch (action.type) {
		case 'ADD_SERVER':
			return [
				...state,
				{
					id: action.id,
					ip: action.ip,
					cpu_us: action.cpu_us,
					mem_us: action.mem_us,
					mem_tot: action.mem_tot
				}
			]
		case 'UPDATE_CARD':
			return state.map(server => (server.id === action.id) ? {
				...server,
				id: action.id,
				ip: action.ip,
				cpu_us: action.cpu_us,
				mem_us: action.mem_us,
				mem_tot: action.mem_tot	
				} : server
			 )
		default:
			return state;
	}
}

export default servers
