export default class Request {
	
	static getPassword = (userId) => {
		return uni.$u.http.get(`/user/${userId}/genPassword`)
	}
	
	static login = (param) => {
		return uni.$u.http.post(`/user/login`, param)
	}
	
	static fetchRecords = (param) => {
		return uni.$u.http.post(`/todoRecords/search`, param)
	}
	
	static getDetail = (id) => {
		return uni.$u.http.get(`/todoRecord/${id}`)
	}
	
	static createTodo = (param) => {
		return uni.$u.http.post('/todos/upsert', param)
	}
	
	static done = (id) => {
		return uni.$u.http.post(`/todoRecord/${id}/done`)
	}
	
	static undo = (id) => {
		return uni.$u.http.post(`/todoRecord/${id}/undo`)
	}
	
	static deleteTodo = (id) => {
		return uni.$u.http.delete(`/todos/${id}`)
	}
	
	static validToken = () => {
		return uni.$u.http.post('/user/validToken')
	}
}