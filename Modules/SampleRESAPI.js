modules['myModule'] = {

	moduleID: 'myModule',

	moduleName: 'my module',

	options: {

		// any configurable options you have go here...

		// options must have a type and a value.. 

		// valid types are: text, boolean (if boolean, value must be true or false)

		// for example:

		defaultMessage: {

			type: 'text',

			value: 'this is default text',

			description: 'explanation of what this option is for'

		},

		secretKey: {

			type: 'text',

			value: 'secret123',

			description: 'your secret key! oooo, secrets!'

		},

		doSpecialStuff: {

			type: 'boolean',

			value: false,

			description: 'explanation of what this option is for'

		},

		whichOne: {

			type: 'enum',

			values: [

				{ name: 'the first option', value: 'firstOption' },

				{ name: 'the second option', value: 'secondOption' },

				{ name: 'the third option', value: 'thirdOption' }

			],

			description: 'explanation of what this option is for'

			},

			someKeyThatDoesSomething: {

				type: 'keycode',
			
				value: 13, // enter key

				description: 'do something awesome when the user hits this key!'

			},

			someTableOfStuff: {

				type: 'table',

				fields: [

					{ name: 'someField', type: 'text' },

					{ name: 'anotherField', type: 'boolean' }

				],

				value: [

					['firstValueOfSomeField',false],

					['secondValueOfSomeField',true],

					['thirdValueOfSomeField',true]

				]

			}

		},

		description: 'This is my module!',

			isEnabled: function() {

				return RESConsole.getModulePrefs(this.moduleID);

			},

			include: Array(

				/http:\/\/www.reddit.com\/user\/[-\w\.]+/i,

				/http:\/\/www.reddit.com\/message\/inbox\/[-\w\.]+/i,

				/http:\/\/www.reddit.com\/message\/comments\/[-\w\.]+/i

			),

			isMatchURL: function() {

				return RESUtils.isMatchURL(this.moduleID);

			},

			go: function() {

				if ((this.isEnabled()) && (this.isMatchURL())) {

					// get this module's options...

					RESUtils.getOptions(this.moduleID);

					// do stuff now!

					// this is where your code goes...

				}

			}

		}; // note: you NEED this semicolon at the end!