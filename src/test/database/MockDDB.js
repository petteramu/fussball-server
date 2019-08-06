class MockDDB {
	
	put (params, fn) {
		return {
			promise: this.promise.bind(this, params)
		}
	}

	delete (params, fn) {
		return {
			promise: this.promise.bind(this, params)
		}
	}

	get (params, fn) {
		let result = this.getItemResult || params
		return {
			promise: this.promise.bind(this, result)
		}
	}

	query (params, fn) {
		return {
			promise: this.promise.bind(this, params)
		}
	}

	scan (params, fn) {
		return {
			promise: this.promise.bind(this, params)
		}
	}

	returnFromGetItem (params) {
		this.getItemResult = params
	}

	update (params, fn) {
		return {
			promise: this.promise.bind(this, params)
		}
	}

	promise (params) {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				resolve(params)
			}, 0)
		})
	}
}

module.exports = MockDDB