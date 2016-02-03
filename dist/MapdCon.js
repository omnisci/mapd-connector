/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * The MapdCon class provides the necessary methods for performing queries to a
	 * MapD GPU database. In order to use MapdCon, you must have the Thrift library
	 * loaded into the <code>window</code> object first.
	 */

	var MapdCon = function () {

	  /**
	   * Create a new MapdCon and return it to allow method chaining.
	   * @return {MapdCon} Object
	   *
	   * @example <caption>Create a new MapdCon instance:</caption>
	   * var con = new MapdCon();
	   *
	   * @example <caption>Create a new MapdCon instance and set the host via method chaining:</caption>
	   * var con = new MapdCon().host('http://hostname.com');
	   */

	  function MapdCon() {
	    var _this = this;

	    _classCallCheck(this, MapdCon);

	    this._host = null;
	    this._user = null;
	    this._password = null;
	    this._port = null;
	    this._dbName = null;
	    this._client = null;
	    this._sessionId = null;
	    this._datumEnum = {};
	    this._logging = false;
	    this._platform = 'mapd';
	    this._nonce = 0;
	    this._balanceStrategy = 'adaptive';
	    this._numConnections = 0;
	    this._lastRenderCon = 0;
	    this.queryTimes = {};
	    this.serverQueueTimes = null;
	    this.serverPingTimes = null;
	    this.pingCount = null;
	    this.DEFAULT_QUERY_TIME = 50;
	    this.NUM_PINGS_PER_SERVER = 4;

	    // invoke initialization methods
	    this.invertDatumTypes();

	    /** Deprecated */
	    this.setHost = this.host;

	    /** Deprecated */
	    this.setPort = this.port;

	    /** Deprecated */
	    this.setDbName = this.dbName;

	    /** Deprecated */
	    this.setPlatform = this.platform;

	    /** Deprecated */
	    this.setUserAndPassword = function (user, password) {
	      _this._user = !Array.isArray(user) ? [user] : user;
	      _this._password = !Array.isArray(password) ? [password] : password;
	      return _this;
	    };

	    /** Deprecated */
	    this.getPlatform = this.platform;

	    /** Deprecated */
	    this.getSessionId = this.sessionId;

	    /** Deprecated */
	    this.queryAsync = this.query;

	    // return this to allow chaining off of instantiation
	    return this;
	  }

	  /**
	   * Create a connection to the server, generating a client and session id.
	   * @return {MapdCon} Object
	   *
	   * @example <caption>Connect to a MapD server:</caption>
	   * var con = new MapdCon()
	   *   .host('localhost')
	   *   .port('8080')
	   *   .dbName('myDatabase')
	   *   .user('foo')
	   *   .password('bar')
	   *   .connect();
	   * // con.client() instanceof MapDClient === true
	   * // con.sessionId() === 2070686863
	   */

	  _createClass(MapdCon, [{
	    key: 'connect',
	    value: function connect(callback) {
	      if (this._sessionId) {
	        this.disconnect();
	      }
	      // TODO: should be its own function
	      var allAreArrays = Array.isArray(this._host) && Array.isArray(this._port) && Array.isArray(this._user) && Array.isArray(this._password) && Array.isArray(this._dbName);
	      if (!allAreArrays) {
	        throw new Error('All connection parameters must be arrays.');
	      }

	      this._client = [];
	      this._sessionId = [];

	      // now check to see if length of all arrays are the same and > 0
	      var hostLength = this._host.length;
	      if (hostLength < 1) {
	        throw new Error('Must have at least one server to connect to.');
	      }
	      if (hostLength !== this._port.length || hostLength !== this._user.length || hostLength !== this._password.length || hostLength !== this._dbName.length) {
	        throw new Error('Array connection parameters must be of equal length.');
	      }

	      for (var h = 0; h < hostLength; h++) {
	        var transportUrl = 'http://' + this._host[h] + ':' + this._port[h];
	        try {
	          var transport = new Thrift.Transport(transportUrl);
	          var protocol = new Thrift.Protocol(transport);
	          var client = new MapDClient(protocol);
	          var sessionId = client.connect(this._user[h], this._password[h], this._dbName[h]);
	          this._client.push(client);
	          this._sessionId.push(sessionId);
	        } catch (err) {
	          throw err;
	        }
	      }
	      this._numConnections = this._client.length;
	      if (this._numConnections < 1) {
	        // need at least one server to connect to
	        // clean up first
	        this._client = null;
	        this._sessionId = null;
	        throw new Error('Could not connect to any servers in list.');
	      }
	      this.serverQueueTimes = Array.apply(null, Array(this._numConnections)).map(Number.prototype.valueOf, 0);
	      // only run ping servers if the caller gives a callback
	      // - this is a promise by them to wait until the callback returns to query
	      //   the database to avoid skewing the results
	      if (callback) {
	        this.pingServers(callback);
	      }
	      return this;
	    }

	    /**
	     * Disconnect from the server then clears the client and session values.
	     * @return {MapdCon} Object
	     *
	     * @example <caption>Disconnect from the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * con.disconnect();
	     * // con.client() === null;
	     * // con.sessionId() === null;
	     */

	  }, {
	    key: 'disconnect',
	    value: function disconnect() {
	      if (this._sessionId !== null) {
	        for (var c = 0; c < this._client.length; c++) {
	          this._client[c].disconnect(this._sessionId[c]);
	        }
	        this._sessionId = null;
	        this._client = null;
	        this._numConnections = 0;
	        this.serverPingTimes = null;
	      }
	      return this;
	    }

	    /**
	     * TODO
	     */

	  }, {
	    key: 'pingServers',
	    value: function pingServers(callback) {
	      if (this._sessionId !== null) {
	        this.serverPingTimes = Array.apply(null, Array(this._numConnections)).map(Number.prototype.valueOf, 0);
	        this.pingCount = 0;
	        for (var c = 0; c < this._numConnections; c++) {
	          for (var i = 0; i < this.NUM_PINGS_PER_SERVER; i++) {
	            var startTime = new Date();
	            this._client[c].get_server_status(this._sessionId[c], this.pingServersCallback.bind(this, startTime, c, callback));
	          }
	        }
	      }
	    }

	    /**
	     * TODO
	     */

	  }, {
	    key: 'pingServersCallback',
	    value: function pingServersCallback(startTime, serverNum, callback) {
	      var now = new Date();
	      var duration = now - startTime;
	      this.serverPingTimes[serverNum] += duration;
	      this.pingCount++;
	      if (this.pingCount === this._numConnections * this.NUM_PINGS_PER_SERVER) {
	        this.pingCount = 0;
	        for (var c = 0; c < this._numConnections; c++) {
	          this.serverPingTimes[c] /= this.NUM_PINGS_PER_SERVER;
	          // handicap each server based on its ping time
	          // - this should be persistent as we never zero our times
	          this.serverQueueTimes[c] += this.serverPingTimes[c];
	        }
	        console.log(this.serverQueueTimes);
	        if (typeof callback !== 'undefined') {
	          callback();
	        }
	      }
	    }

	    /**
	     * TODO
	     */

	  }, {
	    key: 'balanceStrategy',
	    value: function balanceStrategy(_balanceStrategy) {
	      if (!arguments.length) {
	        return this._balanceStrategy;
	      }
	      this._balanceStrategy = _balanceStrategy;
	      return this;
	    }

	    /**
	     * Get the recent dashboards as a list of <code>TFrontendView</code> objects.
	     * These objects contain a value for the <code>view_name</code> property,
	     * but not for the <code>view_state</code> property.
	     * @return {Array<TFrontendView>}
	     *
	     * @example <caption>Get the list of dashboards from the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * var views = con.getFrontendViews();
	     * // views === [TFrontendView, TFrontendView]
	     */

	  }, {
	    key: 'getFrontendViews',
	    value: function getFrontendViews() {
	      var result = null;
	      if (this._sessionId) {
	        try {
	          result = this._client[0].get_frontend_views(this._sessionId);
	        } catch (err) {
	          throw err;
	        }
	      }
	      return result;
	    }

	    /**
	     * Get a dashboard object containing a value for the <code>view_state</code> property.
	     * This object contains a value for the <code>view_state</code> property,
	     * but not for the <code>view_name</code> property.
	     * @param {String} viewName - the name of the dashboard
	     * @return {TFrontendView} Object
	     *
	     * @example <caption>Get a specific dashboard from the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * var dashboard = con.getFrontendView();
	     * // dashboard instanceof TFrontendView === true
	     */

	  }, {
	    key: 'getFrontendView',
	    value: function getFrontendView(viewName) {
	      var result = null;
	      if (this._sessionId && viewName) {
	        try {
	          result = this._client[0].get_frontend_view(this._sessionId, viewName);
	        } catch (err) {
	          throw err;
	        }
	      }
	      return result;
	    }

	    /**
	     * Get the status of the server as a <code>TServerStatus</code> object.
	     * This includes whether the server is read-only,
	     * has backend rendering enabled, and the version number.
	     * @return {TServerStatus} Object
	     *
	     * @example <caption>Get the server status:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect(); // Create a connection
	     *
	     * var status = con.getServerStatus();
	     * // status instanceof TServerStatus === true
	     *
	     */

	  }, {
	    key: 'getServerStatus',
	    value: function getServerStatus() {
	      var result = null;
	      try {
	        result = this._client[0].get_server_status();
	      } catch (err) {
	        throw err;
	      }
	      return result;
	    }

	    /**
	     * Generate the image thumbnail hash used for saving frontend view.
	     * @param {String} input - The string input to hash
	     * @return {Number} hash - Numerical hash used for saving dashboards
	     *
	     * @example <caption>Generate an hash</caption>
	     * var hash = generateImageThumbnailHashCode(Math.random().toString());
	     * // hash === 3003444
	     */

	  }, {
	    key: 'generateImageThumbnailHashCode',
	    value: function generateImageThumbnailHashCode(input) {
	      return input.split('').reduce(function (a, b) {
	        a = (a << 5) - a + b.charCodeAt(0);
	        return a & a;
	      }, 0);
	    }

	    /**
	     * Generate the state string used for saving frontend view.
	     * @param {Object} state - The object containing the state
	     * @param {Boolean} encode=false - Indicates whether to base64 encode the output string
	     * @return {String} stateString - The string representation of the state object
	     *
	     * @example <caption>Generate a raw state string:</caption>
	     * var state = generateViewStateString({id: 5});
	     * // state === ''
	     *
	     * @example <caption>Generate an encoded state string:</caption>
	     * var state = generateViewStateString({id: 5}, true);
	     * // state === ''
	     */

	  }, {
	    key: 'generateViewStateString',
	    value: function generateViewStateString(state, encode) {}
	    // TODO

	    /**
	     * Add a new dashboard to the server.
	     * @param {String} viewName - the name of the new dashboard
	     * @param {String} viewState - the base64-encoded state string of the new dashboard
	     * @param {String} imageHash - the numeric hash of the dashboard thumbnail
	     * @return {MapdCon} Object
	     *
	     * @example <caption>Add a new dashboard to the server:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * con.createFrontendView('newView', 'GlnaHRz...', '1906667617');
	     */

	  }, {
	    key: 'createFrontendView',
	    value: function createFrontendView(viewName, viewState, imageHash) {
	      try {
	        for (var c = 0; c < this._numConnections; c++) {
	          // do we want to try each one individually so if we fail we keep going?
	          this._client[c].create_frontend_view(this._sessionId[c], viewName, viewState, imageHash);
	        }
	      } catch (err) {
	        throw err;
	      }
	      return this;
	    }

	    /**
	     * Create a short hash to make it easy to share a link to a specific dashboard.
	     * @param {String} viewState - the base64-encoded state string of the new dashboard
	     * @return {String} link - A short hash of the dashboard used for URLs
	     *
	     * @example <caption>Create a link to the current state of a dashboard:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * // get a dashboard
	     * var dashboards = con.getFrontendViews();
	     * var dashboard = con.getFrontendView(dashboards[0].view_name);
	     *
	     * var link = con.createLink(dashboard.view_state);
	     * // link === 'CRtzoe'
	     */

	  }, {
	    key: 'createLink',
	    value: function createLink(viewState) {
	      var _this2 = this;

	      var result = null;
	      try {
	        result = this._client.map(function (client, i) {
	          return client.create_link(_this2._sessionId[i], viewState);
	        }).reduce(function (links, link) {
	          if (links.indexOf(link) === -1) {
	            links.push(link);
	          }
	          return links;
	        }, []);
	        if (!result || result.length !== 1) {
	          throw new Error('Different links were created on each connection');
	        } else {
	          return result.join();
	        }
	      } catch (err) {
	        throw err;
	      }
	    }

	    /**
	     * Get a fully-formed dashboard object from a generated share link.
	     * This object contains the given link for the <code>view_name</code> property,
	     * @param {String} link - the short hash of the dashboard, see {@link createLink}
	     * @return {TFrontendView} Object
	     *
	     * @example <caption>Get a dashboard from a link:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * var dashboard = con.getLinkView('CRtzoe');
	     * // dashboard instanceof TFrontendView === true
	     */

	  }, {
	    key: 'getLinkView',
	    value: function getLinkView(link) {
	      var result = null;
	      try {
	        result = this._client[0].get_link_view(this._sessionId[0], link);
	      } catch (err) {
	        throw err;
	      }
	      return result;
	    }

	    /**
	     * Asynchronously get the data from an importable file,
	     * such as a .csv or plaintext file with a header.
	     * @param {String} fileName - the name of the importable file
	     * @param {TCopyParams} copyParams - see {@link TCopyParams}
	     * @param {Function} callback - specify a callback that takes a
	     *                              {@link TDetectResult} as its only argument
	     *
	     * @example <caption>Get data from table_data.csv:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * var copyParams = new TCopyParams();
	     * con.detectColumnTypes('table_data.csv', copyParams, function(tableData){
	     *   var columnHeaders = tableData.row_set.row_desc;
	     *   // columnHeaders === [TColumnType, TColumnType, ...]
	     *
	     *   var data = tableData.row_set.rows;
	     *   ...
	     * });
	     */

	  }, {
	    key: 'detectColumnTypes',
	    value: function detectColumnTypes(fileName, copyParams, callback) {
	      copyParams.delimiter = copyParams.delimiter || '';
	      try {
	        this._client[0].detect_column_types(this._sessionId[0], fileName, copyParams, callback);
	      } catch (err) {
	        throw err;
	      }
	    }

	    /**
	     * Submit a query to the database and process the results through an array
	     * of asychronous callbacks. If no callbacks are given, use synchronous instead.
	     * TODO: Refactor to use take a query and an options object
	     * @param {String} query - The query to perform
	     * @param {Object} options - the options for the query
	     * @param {Boolean} options.columnarResults=true - Indicates whether to return the data
	     *                                             in columnar format. This saves time on the backend.
	     * @param {Boolean} options.eliminateNullRows
	     * @param {String} options.renderSpec - The backend rendering spec,
	     *                                      set to <code>null</code> to force frontend rendering
	     * @param {Array<Function>} callbacks
	     */

	  }, {
	    key: 'query',
	    value: function query(_query, options, callbacks) {
	      var columnarResults = true;
	      var eliminateNullRows = false;
	      var renderSpec = null;
	      var queryId = null;
	      if (options) {
	        columnarResults = options.hasOwnProperty('columnarResults') ? options.columnarResults : columnarResults;
	        eliminateNullRows = options.hasOwnProperty('eliminateNullRows') ? options.eliminateNullRows : eliminateNullRows;
	        renderSpec = options.hasOwnProperty('renderSpec') ? options.renderSpec : renderSpec;
	        queryId = options.hasOwnProperty('queryId') ? options.queryId : queryId;
	      }
	      var processResultsQuery = renderSpec ? 'render: ' + _query : _query;
	      var isBackendRenderingWithAsync = !!renderSpec && !!callbacks;
	      var isFrontendRenderingWithAsync = !renderSpec && !!callbacks;
	      var isBackendRenderingWithSync = !!renderSpec && !callbacks;
	      var isFrontendRenderingWithSync = !renderSpec && !callbacks;
	      var lastQueryTime = queryId in this.queryTimes ? this.queryTimes[queryId] : this.DEFAULT_QUERY_TIME;

	      var curNonce = (this._nonce++).toString();

	      var conId = null;
	      if (this._balanceStrategy === 'adaptive') {
	        conId = this.serverQueueTimes.indexOf(Math.min.apply(Math, this.serverQueueTimes));
	      } else {
	        conId = curNonce % this._numConnections;
	      }
	      if (!!renderSpec) {
	        this._lastRenderCon = conId;
	      }

	      this.serverQueueTimes[conId] += lastQueryTime;
	      // console.log("Up: " + this.serverQueueTimes);

	      var processResultsOptions = {
	        isImage: !!renderSpec,
	        eliminateNullRows: eliminateNullRows,
	        query: processResultsQuery,
	        queryId: queryId,
	        conId: conId,
	        estimatedQueryTime: lastQueryTime
	      };

	      try {
	        if (isBackendRenderingWithAsync) {
	          var callback = this.processResults.bind(this, processResultsOptions, callbacks);
	          this._client[conId].render(this._sessionId[conId], _query + ';', renderSpec, {}, {}, curNonce, callback);
	          return curNonce;
	        } else if (isFrontendRenderingWithAsync) {
	          var callback = this.processResults.bind(this, processResultsOptions, callbacks);
	          this._client[conId].sql_execute(this._sessionId[conId], _query + ';', columnarResults, curNonce, callback);
	          return curNonce;
	        } else if (isBackendRenderingWithSync) {
	          return this.processResults(processResultsOptions, null, this._client[conId].render( // probably should assign this to a variable
	          this._sessionId[conId], _query + ';', renderSpec, {}, {}, curNonce));
	        } else if (isFrontendRenderingWithSync) {
	          var _result = this._client[conId].sql_execute(this._sessionId[conId], _query + ';', columnarResults, curNonce);
	          return this.processResults(processResultsOptions, null, _result); // null is callbacks slot
	        }
	      } catch (err) {
	        console.error(err);
	        if (err.name === 'NetworkError') {
	          this.removeConnection(conId);
	          if (this._numConnections === 0) {
	            // should we try to reconnect?
	            err.msg = 'No remaining database connections';
	            throw err;
	          }
	          this.query(_query, options, callbacks);
	        }
	      }
	    }

	    /**
	     * TODO
	     */

	  }, {
	    key: 'removeConnection',
	    value: function removeConnection(conId) {
	      if (conId < 0 || conId >= this.numConnections) {
	        var err = {
	          msg: 'Remove connection id invalid'
	        };
	        throw err;
	      }
	      this._client.splice(conId, 1);
	      this._sessionId.splice(conId, 1);
	      this._numConnections--;
	    }

	    /**
	     * Because it is inefficient for the server to return a row-based
	     * data structure, it is better to process the column-based results into a row-based
	     * format after the fact.
	     *
	     * @param {TRowSet} data - The column-based data returned from a query
	     * @param {Boolean} eliminateNullRows
	     * @returns {Object} processedResults
	     */

	  }, {
	    key: 'processColumnarResults',
	    value: function processColumnarResults(data, eliminateNullRows) {
	      var _this3 = this;

	      var formattedResult = { fields: [], results: [] };
	      var numCols = data.row_desc.length;
	      var numRows = data.columns[0] !== undefined ? data.columns[0].nulls.length : 0;

	      formattedResult.fields = data.row_desc.map(function (field) {
	        return {
	          name: field.col_name,
	          type: _this3._datumEnum[field.col_type.type],
	          is_array: field.col_type.is_array
	        };
	      });

	      for (var r = 0; r < numRows; r++) {
	        if (eliminateNullRows) {
	          var rowHasNull = false;
	          for (var c = 0; c < numCols; c++) {
	            if (data.columns[c].nulls[r]) {
	              rowHasNull = true;
	              break;
	            }
	          }
	          if (rowHasNull) {
	            continue;
	          }
	        }
	        var row = {};
	        for (var c = 0; c < numCols; c++) {
	          var fieldName = formattedResult.fields[c].name;
	          var fieldType = formattedResult.fields[c].type;
	          var fieldIsArray = formattedResult.fields[c].is_array;
	          var isNull = data.columns[c].nulls[r];
	          if (isNull) {
	            // row[fieldName] = "NULL";
	            row[fieldName] = null;
	            continue;
	          }
	          if (fieldIsArray) {
	            row[fieldName] = [];
	            var arrayNumElems = data.columns[c].data.arr_col[r].nulls.length;
	            for (var e = 0; e < arrayNumElems; e++) {
	              if (data.columns[c].data.arr_col[r].nulls[e]) {
	                row[fieldName].push('NULL');
	                continue;
	              }
	              switch (fieldType) {
	                case 'BOOL':
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e] ? true : false);
	                  break;
	                case 'SMALLINT':
	                case 'INT':
	                case 'BIGINT':
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e]);
	                  break;
	                case 'FLOAT':
	                case 'DOUBLE':
	                case 'DECIMAL':
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.real_col[e]);
	                  break;
	                case 'STR':
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.str_col[e]);
	                  break;
	                case 'TIME':
	                case 'TIMESTAMP':
	                case 'DATE':
	                  row[fieldName].push(data.columns[c].data.arr_col[r].data.int_col[e] * 1000);
	                  break;
	                default:
	                  break;
	              }
	            }
	          } else {
	            switch (fieldType) {
	              case 'BOOL':
	                row[fieldName] = data.columns[c].data.int_col[r] ? true : false;
	                break;
	              case 'SMALLINT':
	              case 'INT':
	              case 'BIGINT':
	                row[fieldName] = data.columns[c].data.int_col[r];
	                break;
	              case 'FLOAT':
	              case 'DOUBLE':
	              case 'DECIMAL':
	                row[fieldName] = data.columns[c].data.real_col[r];
	                break;
	              case 'STR':
	                row[fieldName] = data.columns[c].data.str_col[r];
	                break;
	              case 'TIME':
	              case 'TIMESTAMP':
	              case 'DATE':
	                row[fieldName] = new Date(data.columns[c].data.int_col[r] * 1000);
	                break;
	              default:
	                break;
	            }
	          }
	        }
	        formattedResult.results.push(row);
	      }
	      return formattedResult;
	    }

	    /**
	     * It should be avoided to query for row-based results from the server, howerver
	     * it can still be done. In this case, still process them into the same format as
	     * (@link processColumnarResults} to keep the output consistent.
	     * @param {TRowSet} data - The row-based data returned from a query
	     * @param {Boolean} eliminateNullRows
	     * @returns {Object} processedResults
	     */

	  }, {
	    key: 'processRowResults',
	    value: function processRowResults(data, eliminateNullRows) {
	      var _this4 = this;

	      var numCols = data.row_desc.length;
	      var formattedResult = { fields: [], results: [] };

	      formattedResult.fields = data.row_desc.map(function (field) {
	        return {
	          name: field.col_name,
	          type: _this4._datumEnum[field.col_type.type],
	          is_array: field.col_type.is_array
	        };
	      });

	      formattedResult.results = [];
	      var numRows = 0;
	      if (data.rows !== undefined && data.rows !== null) {
	        numRows = data.rows.length; // so won't throw if data.rows is missing
	      }

	      for (var r = 0; r < numRows; r++) {
	        if (eliminateNullRows) {
	          var rowHasNull = false;
	          for (var c = 0; c < numCols; c++) {
	            if (data.rows[r].columns[c].is_null) {
	              rowHasNull = true;
	              break;
	            }
	          }
	          if (rowHasNull) {
	            continue;
	          }
	        }

	        var row = {};
	        for (var c = 0; c < numCols; c++) {
	          var fieldName = formattedResult.fields[c].name;
	          var fieldType = formattedResult.fields[c].type;
	          var fieldIsArray = formattedResult.fields[c].is_array;
	          if (fieldIsArray) {
	            if (data.rows[r].cols[c].is_null) {
	              row[fieldName] = 'NULL';
	              continue;
	            }
	            row[fieldName] = [];
	            var arrayNumElems = data.rows[r].cols[c].val.arr_val.length;
	            for (var e = 0; e < arrayNumElems; e++) {
	              var elemDatum = data.rows[r].cols[c].val.arr_val[e];
	              if (elemDatum.is_null) {
	                row[fieldName].push('NULL');
	                continue;
	              }
	              switch (fieldType) {
	                case 'BOOL':
	                  row[fieldName].push(elemDatum.val.int_val ? true : false);
	                  break;
	                case 'SMALLINT':
	                case 'INT':
	                case 'BIGINT':
	                  row[fieldName].push(elemDatum.val.int_val);
	                  break;
	                case 'FLOAT':
	                case 'DOUBLE':
	                case 'DECIMAL':
	                  row[fieldName].push(elemDatum.val.real_val);
	                  break;
	                case 'STR':
	                  row[fieldName].push(elemDatum.val.str_val);
	                  break;
	                case 'TIME':
	                case 'TIMESTAMP':
	                case 'DATE':
	                  row[fieldName].push(elemDatum.val.int_val * 1000);
	                  break;
	                default:
	                  break;
	              }
	            }
	          } else {
	            var scalarDatum = data.rows[r].cols[c];
	            if (scalarDatum.is_null) {
	              row[fieldName] = 'NULL';
	              continue;
	            }
	            switch (fieldType) {
	              case 'BOOL':
	                row[fieldName] = scalarDatum.val.int_val ? true : false;
	                break;
	              case 'SMALLINT':
	              case 'INT':
	              case 'BIGINT':
	                row[fieldName] = scalarDatum.val.int_val;
	                break;
	              case 'FLOAT':
	              case 'DOUBLE':
	              case 'DECIMAL':
	                row[fieldName] = scalarDatum.val.real_val;
	                break;
	              case 'STR':
	                row[fieldName] = scalarDatum.val.str_val;
	                break;
	              case 'TIME':
	              case 'TIMESTAMP':
	              case 'DATE':
	                row[fieldName] = new Date(scalarDatum.val.int_val * 1000);
	                break;
	              default:
	                break;
	            }
	          }
	        }
	        formattedResult.results.push(row);
	      }
	      return formattedResult;
	    }

	    /**
	     * TODO: Fix docs
	     * Decides how to process raw results once they come back from the server.
	     *
	     * @param {Boolean} isImage - Set to true when querying for backend rendered images
	     * @param {Boolean} eliminateNullRows
	     * @param {String} query - The SQL query string used only for logging
	     * @param {Array<Function>} callbacks
	     * @param {Object} result - The query result used to decide whether to process
	     *                          as column or row results.
	     * @return {Object} null if image with callbacks, result if image with callbacks,
	     *                  otherwise formatted results
	     */

	  }, {
	    key: 'processResults',
	    value: function processResults(options, callbacks, result) {
	      var isImage = false;
	      var eliminateNullRows = false;
	      var query = null;
	      var queryId = null;
	      var conId = null;
	      var estimatedQueryTime = null;
	      var hasCallback = !!callbacks;

	      if (typeof options !== 'undefined') {
	        isImage = options.isImage ? options.isImage : false;
	        eliminateNullRows = options.eliminateNullRows ? options.eliminateNullRows : false;
	        query = options.query ? options.query : null;
	        queryId = options.queryId ? options.queryId : null;
	        conId = typeof options.conId !== 'undefined' ? options.conId : null;
	        estimatedQueryTime = typeof options.estimatedQueryTime !== 'undefined' ? options.estimatedQueryTime : null;
	      }
	      if (result.execution_time_ms && conId !== null && estimatedQueryTime !== null) {
	        this.serverQueueTimes[conId] -= estimatedQueryTime;
	        // console.log("Down: " + this.serverQueueTimes);
	        this.queryTimes[queryId] = result.execution_time_ms;
	      }

	      if (this._logging && result.execution_time_ms) {
	        console.log(query, 'on Server', conId, '- Execution Time:', result.execution_time_ms, ' ms, Total Time:', result.total_time_ms + 'ms');
	      }

	      if (isImage && hasCallback) {
	        callbacks.pop()(result, callbacks);
	      } else if (isImage && !hasCallback) {
	        return result;
	      } else {
	        result = result.row_set;
	        var formattedResult = null;
	        if (result.is_columnar) {
	          formattedResult = this.processColumnarResults(result, eliminateNullRows);
	        } else {
	          formattedResult = this.processRowResults(result, eliminateNullRows);
	        }
	        if (hasCallback) {
	          callbacks.pop()(formattedResult.results, callbacks);
	        } else {
	          return formattedResult.results;
	        }
	      }
	    }

	    /**
	     * Get the names of the databases that exist on the current session's connectdion.
	     * @return {Array<String>} list of database names
	     *
	     * @example <caption>Create a new MapdCon instance and set the host via method chaining:</caption>
	     * var databases = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .getDatabases();
	     * // databases === ['databasename', 'databasename', ...]
	     */

	  }, {
	    key: 'getDatabases',
	    value: function getDatabases() {
	      var databases = null;
	      try {
	        databases = this._client[0].get_databases();
	        return databases.map(function (db) {
	          return db.db_name;
	        });
	      } catch (err) {
	        throw err;
	      }
	    }

	    /**
	     * Get the names of the databases that exist on the current session's connectdion.
	     * @return {Array<Object>} list of table objects containing the label and table names.
	     *
	     * @example <caption>Get the list of tables from a connection:</caption>
	     * var tables = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .getTables();
	     * // tables === [{
	     *    label: 'obs', // deprecated property
	     *    name: 'myDatabaseName'
	     *  }, ...]
	     */

	  }, {
	    key: 'getTables',
	    value: function getTables() {
	      var tabs = null;
	      try {
	        tabs = this._client[0].get_tables(this._sessionId[0]);
	      } catch (err) {
	        throw err;
	      }

	      var numTables = tabs.length;
	      var tableInfo = [];
	      for (var t = 0; t < numTables; t++) {
	        tableInfo.push({
	          name: tabs[t],
	          label: 'obs'
	        });
	      }
	      return tableInfo;
	    }

	    /**
	     * Create an array-like object from {@link TDatumType} by
	     * flipping the string key and numerical value around.
	     */

	  }, {
	    key: 'invertDatumTypes',
	    value: function invertDatumTypes() {
	      for (var key in TDatumType) {
	        if (TDatumType.hasOwnProperty(key)) {
	          this._datumEnum[TDatumType[key]] = key;
	        }
	      }
	    }

	    /**
	     * Get a list of field objects for a given table.
	     * @param {String} tableName - name of table containing field names
	     * @return {Array<Object>} fields - the formmatted list of field objects
	     *
	     * @example <caption>Get the list of fields from a specific table:</caption>
	     * var tables = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .getTables();
	     *
	     * var fields = con.getFields(tables[0].name);
	     * // fields === [{
	     *   name: 'fieldName',
	     *   type: 'BIGINT',
	     *   is_array: false,
	     *   is_dict: false
	     * }, ...]
	     */

	  }, {
	    key: 'getFields',
	    value: function getFields(tableName) {
	      var fields = null;
	      try {
	        fields = this._client[0].get_table_descriptor(this._sessionId[0], tableName);
	      } catch (err) {
	        throw new Error('Table (' + tableName + ') not found');
	      }
	      var fieldsArray = [];
	      // silly to change this from map to array
	      // - then later it turns back to map
	      for (var key in fields) {
	        if (fields.hasOwnProperty(key)) {
	          fieldsArray.push({
	            name: key,
	            type: this._datumEnum[fields[key].col_type.type],
	            is_array: fields[key].col_type.is_array,
	            is_dict: fields[key].col_type.encoding === TEncodingType.DICT
	          });
	        }
	      }
	      return fieldsArray;
	    }

	    /**
	     * Create a table and persist it to the backend.
	     * @param {String} tableName - desired name of the new table
	     * @param {Array<TColumnType>} rowDesc - fields of the new table
	     * @param {Function} callback
	     *
	     * @example <caption>Create a new table:</caption>
	     * var result = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .createTable('mynewtable', [TColumnType, TColumnType, ...], cb);
	     */

	  }, {
	    key: 'createTable',
	    value: function createTable(tableName, rowDesc, callback) {
	      var result = null;
	      try {
	        for (var c = 0; c < this._numConnections; c++) {
	          result = this._client[c].send_create_table(this._sessionId[c], tableName, rowDesc, callback);
	        }
	      } catch (err) {
	        throw err;
	      }
	    }

	    /**
	     * Import a table from a file.
	     * @param {String} tableName - desired name of the new table
	     * @param {String} fileName
	     * @param {TCopyParams} copyParams - see {@link TCopyParams}
	     * @param {Function} callback
	     */

	  }, {
	    key: 'importTable',
	    value: function importTable(tableName, fileName, copyParams, callback) {
	      copyParams.delimiter = copyParams.delimiter || '';
	      var result = null;
	      try {
	        for (var c = 0; c < this._numConnections; c++) {
	          result = this._client[c].send_import_table(this._sessionId[c], tableName, fileName, copyParams, callback);
	        }
	      } catch (err) {
	        throw err;
	      }
	    }

	    /**
	     * Get the status of the table import operation.
	     * @param {TCopyParams} importId
	     * @param {Function} callback
	     */

	  }, {
	    key: 'importTableStatus',
	    value: function importTableStatus(importId, callback) {
	      var importStatus = null;
	      try {
	        importStatus = this._client[0].import_table_status(this._sessionId[0], importId, callback);
	      } catch (err) {
	        throw err;
	      }
	    }

	    /**
	     * Used primarily for backend rendered maps, this method will fetch the rows
	     * that correspond to longitude/latitude points.
	     *
	     * @param {Array<TPixel>} pixels
	     * @param {String} tableName - the table containing the geo data
	     * @param {Array<String>} colNames - the fields to fetch
	     * @param {Array<Function>} callbacks
	     */

	  }, {
	    key: 'getRowsForPixels',
	    value: function getRowsForPixels(pixels, tableName, colNames, callbacks) {
	      var widgetId = 1; // INT
	      var columnFormat = true; // BOOL
	      var curNonce = (this._nonce++).toString();
	      try {
	        if (!callbacks) {
	          return this.processPixelResults(undefined, this._client[this._lastRenderCon].get_rows_for_pixels(this._sessionId[this._lastRenderCon], widgetId, pixels, tableName, colNames, columnFormat, curNonce));
	        }
	        this._client[this._lastRenderCon].get_rows_for_pixels(this._sessionId[this._lastRenderCon], widgetId, pixels, tableName, colNames, columnFormat, curNonce, this.processPixelResults.bind(this, callbacks));
	      } catch (err) {
	        throw err;
	      }
	      return curNonce;
	    }

	    /**
	     * Formats the pixel results into the same pattern as textual results.
	     *
	     * @param {Array<Function>} callbacks
	     * @param {Object} results
	     */

	  }, {
	    key: 'processPixelResults',
	    value: function processPixelResults(callbacks, results) {
	      results = results.pixel_rows;
	      var numPixels = results.length;
	      var processResultsOptions = {
	        isImage: false,
	        eliminateNullRows: false,
	        query: 'pixel request',
	        queryId: -2
	      };
	      for (var p = 0; p < numPixels; p++) {
	        results[p].row_set = this.processResults(processResultsOptions, null, results[p]);
	      }
	      if (!callbacks) {
	        return results;
	      }
	      callbacks.pop()(results, callbacks);
	    }

	    /**
	     * TODO: Returns an empty String.
	     */

	  }, {
	    key: 'getUploadServer',
	    value: function getUploadServer() {
	      return '';
	    }

	    /**
	     * Get or set the session ID used by the server to serve the correct data.
	     * This is typically set by {@link connect} and should not be set manually.
	     * @param {Number} [sessionId] - The session ID of the current connection
	     * @return {Number|MapdCon} - The session ID or the MapdCon itself
	     *
	     * @example <caption>Get the session id:</caption>
	     * var sessionID = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect()
	     *   .sessionId();
	     * // sessionID === 3145846410
	     *
	     * @example <caption>Set the session id:</caption>
	     * var con = new MapdCon().connect().sessionId(3415846410);
	     * // NOTE: It is generally unsafe to set the session id manually.
	     */

	  }, {
	    key: 'sessionId',
	    value: function sessionId(_sessionId) {
	      if (!arguments.length) {
	        return this._sessionId;
	      }
	      this._sessionId = _sessionId;
	      return this;
	    }

	    /**
	     * Get or set the connection server hostname.
	     * This is is typically the first method called after instantiating a new MapdCon.
	     * @param {String} [host] - The hostname address
	     * @return {String|MapdCon} - The hostname or the MapdCon itself
	     *
	     * @example <caption>Set the hostname:</caption>
	     * var con = new MapdCon().host('localhost');
	     *
	     * @example <caption>Get the hostname:</caption>
	     * var host = con.host();
	     * // host === 'localhost'
	     */

	  }, {
	    key: 'host',
	    value: function host(_host) {
	      if (!arguments.length) {
	        return this._host;
	      } else if (!Array.isArray(_host)) {
	        this._host = [_host];
	      } else {
	        this._host = _host;
	      }
	      return this;
	    }

	    /**
	     * Get or set the connection port.
	     * @param {String} [port] - The port to connect on
	     * @return {String|MapdCon} - The port or the MapdCon itself
	     *
	     * @example <caption>Set the port:</caption>
	     * var con = new MapdCon().port('8080');
	     *
	     * @example <caption>Get the port:</caption>
	     * var port = con.port();
	     * // port === '8080'
	     */

	  }, {
	    key: 'port',
	    value: function port(_port) {
	      if (!arguments.length) {
	        return this._port;
	      } else if (!Array.isArray(_port)) {
	        this._port = [_port];
	      } else {
	        this._port = _port;
	      }
	      return this;
	    }

	    /**
	     * Get or set the username to authenticate with.
	     * @param {String} [user] - The username to authenticate with
	     * @return {String|MapdCon} - The username or the MapdCon itself
	     *
	     * @example <caption>Set the username:</caption>
	     * var con = new MapdCon().user('foo');
	     *
	     * @example <caption>Get the username:</caption>
	     * var username = con.user();
	     * // user === 'foo'
	     */

	  }, {
	    key: 'user',
	    value: function user(_user) {
	      if (!arguments.length) {
	        return this._user;
	      } else if (!Array.isArray(_user)) {
	        this._user = [_user];
	      } else {
	        this._user = _user;
	      }
	      return this;
	    }

	    /**
	     * Get or set the user's password to authenticate with.
	     * @param {String} [password] - The password to authenticate with
	     * @return {String|MapdCon} - The password or the MapdCon itself
	     *
	     * @example <caption>Set the password:</caption>
	     * var con = new MapdCon().password('bar');
	     *
	     * @example <caption>Get the username:</caption>
	     * var password = con.password();
	     * // password === 'bar'
	     */

	  }, {
	    key: 'password',
	    value: function password(_password) {
	      if (!arguments.length) {
	        return this._password;
	      } else if (!Array.isArray(_password)) {
	        this._password = [_password];
	      } else {
	        this._password = _password;
	      }
	      return this;
	    }

	    /**
	     * Get or set the name of the database to connect to.
	     * @param {String} [dbName] - The database to connect to
	     * @return {String|MapdCon} - The name of the database or the MapdCon itself
	     *
	     * @example <caption>Set the database name:</caption>
	     * var con = new MapdCon().dbName('myDatabase');
	     *
	     * @example <caption>Get the database name:</caption>
	     * var dbName = con.dbName();
	     * // dbName === 'myDatabase'
	     */

	  }, {
	    key: 'dbName',
	    value: function dbName(_dbName) {
	      if (!arguments.length) {
	        return this._dbName;
	      } else if (!Array.isArray(_dbName)) {
	        this._dbName = [_dbName];
	      } else {
	        this._dbName = _dbName;
	      }
	      return this;
	    }

	    /**
	     * Whether the raw queries strings will be logged to the console.
	     * Used primarily for debugging and defaults to <code>false</code>.
	     * @param {Boolean} [logging] - Set to true to enable logging
	     * @return {Boolean|MapdCon} - The current logging flag or MapdCon itself
	     *
	     * @example <caption>Set logging to true:</caption>
	     * var con = new MapdCon().logging(true);
	     *
	     * @example <caption>Get the logging flag:</caption>
	     * var isLogging = con.logging();
	     * // isLogging === true
	     */

	  }, {
	    key: 'logging',
	    value: function logging(_logging) {
	      if (!arguments.length) {
	        return this._logging;
	      }
	      this._logging = _logging;
	      return this;
	    }

	    /**
	     * The name of the platform.
	     * @param {String} [platform] - The platform, default is "mapd"
	     * @return {String|MapdCon} - The platform or the MapdCon itself
	     *
	     * @example <caption>Set the platform name:</caption>
	     * var con = new MapdCon().platform('myPlatform');
	     *
	     * @example <caption>Get the platform name:</caption>
	     * var platform = con.platform();
	     * // platform === 'myPlatform'
	     */

	  }, {
	    key: 'platform',
	    value: function platform(_platform) {
	      if (!arguments.length) {
	        return this._platform;
	      }
	      this._platform = _platform;
	      return this;
	    }

	    /**
	     * Get the number of connections that are currently open.
	     * @return {Number} - number of open connections
	     *
	     * @example <caption>Get the number of connections:</caption>
	     * var con = new MapdCon()
	     *   .host('localhost')
	     *   .port('8080')
	     *   .dbName('myDatabase')
	     *   .user('foo')
	     *   .password('bar')
	     *   .connect();
	     *
	     * var numConnections = con.numConnections();
	     * // numConnections === 1
	     */

	  }, {
	    key: 'numConnections',
	    value: function numConnections() {
	      return this._numConnections;
	    }

	    /**
	     * The MapDClient instance to perform queries with.
	     * @param {MapDClient} [client] - Thrift object used for communicating with the server
	     * @return {MapDClient|MapdCon} - MapDClient or MapdCon itself
	     *
	     * @example <caption>Set the client:</caption>
	     * var con = new MapdCon().client(client);
	     * // NOTE: It is generally unsafe to set the client manually. Use connect() instead.
	     *
	     * @example <caption>Get the client:</caption>
	     * var client = con.client();
	     * // client instanceof MapDClient === true
	     */

	  }, {
	    key: 'client',
	    value: function client(_client) {
	      if (!arguments.length) {
	        return this._client;
	      }
	      this._client = _client;
	      return this;
	    }
	  }]);

	  return MapdCon;
	}();

	// Set a global mapdcon function when mapdcon is brought in via script tag.

	if (( false ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
	  if (window) {
	    window.MapdCon = MapdCon;
	  }
	}

	exports.default = new MapdCon();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ]);