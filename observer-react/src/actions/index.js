export const addServerCard = (id, ip, cpu_us, mem_us, mem_tot) => ({
	type: 'ADD_SERVER',
	id,
	ip,
	cpu_us,
	mem_us,
	mem_tot
})


export const setVisibilityFilter = filter => ({
	type: 'SET_VISIBILITY_FILTER',
	filter
})

export const VisibilityFilters = {
	SHOW_ALL: 'SHOW_ALL',
	SHOW_ONLINE: 'SHOW_ONLINE',
	SHOW_OFFLINE: 'SHOW_OFFLINE'
}