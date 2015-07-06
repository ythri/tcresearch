'use strict';

var tcresearch = {

	// App variables
	version			: "4.2.2.0", // Default version
	addonAspects	: null,
	combinations	: {},
	aspects			: [],
	graph			: {},

	// Cached objects
	c: {
		$from	: $('#fromSel'),
		$to		: $('#toSel'),
		$steps	: $('#steps'),
		$avail	: $('#avail'),
		$addons	: $('#addons'),
		$version: $('#version'),
	},

	// Add an unidirectional conection between two aspects in the graph
	addConnection: function (from, to) {
		if ( ! (from in this.graph) )
			this.graph[from] = [];
		this.graph[from].push(to);
	},

	// Connects two aspects in the graph
	connect: function (aspect1, aspect2) {
		this.addConnection(aspect1, aspect2);
		this.addConnection(aspect2, aspect1);
	},

	find: function (from, to, steps) {
		var visited = {},
			queue   = new buckets.PriorityQueue(function (a, b) {
				return b.length - a.length;
			});
		queue.enqueue({
			'path': [from],
			'length': 0
		});
		return this.search(queue, to, visited, steps);
	},

	search: function (queue, to, visited, steps) {
		while ( ! queue.isEmpty() ) {

			var element = queue.dequeue(),
				node = element.path.pop();

			if ( ! (node in visited) || visited[node].indexOf(element.path.length) < 0 ) {
				element.path.push(node);
				
				if ( node == to && element.path.length > steps + 1 ) 
					return element.path;

				this.graph[node].forEach(function (entry) {
					var newpath = element.path.slice();
					newpath.push(entry);
					queue.enqueue({
						'path': newpath,
						'length': element.length + getWeight(entry)
					});
				});

				if ( ! (node in visited) ) 
					visited[node] = [];

				visited[node].push(element.path.length - 1);

			};
		}
		return null;
	},

	pushAddons: function (aspects, combinations) {
		
		var self = this,
			addonArray = addon_dictionary;
		self.addonAspects = [],

		$.each(addon_dictionary, function (key, addonInfo) {

			var $addon = $('<div class="checkbox"><input type="checkbox" class="addon_toggle" /><label></label></div>');
			$addon
				.find('input')
					.attr('id', key)
				.next()
					.attr('for', key)
					.text(addonInfo['name'])
				.appendTo(self.c.$addons);

			$.each(addonInfo['combinations'], function (name, comb) {
				self.combinations[name] = comb;
			});

			$.each(addonInfo['aspects'], function (number, aspect) {
				self.addonAspects.push(aspect);
			});
			
		});

		self.addonAspects = self.addonAspects.sort(aspectSort);

		$.each(self.addonAspects, function (number, aspect) {
			aspects.push(aspect);
		});
	},

	enableAspect: function (aspect) {
		$(aspect)
			.removeClass('unavail')
			.find('img')
			.attr('src', function (i, orig) {
				return orig.replace('/mono/', 'color');
			});
	},

	disableAspect: function (aspect) {
		$(aspect)
			.removeClass('unavail')
			.find('img')
			.attr('src', function (i, orig) {
				return orig.replace('/color/', 'mono');
			});
	},

	toggle: function (aspect) {
		if ( $(aspect).hasClass('unavail') )
			this.enableAspect(aspect);
		this.disableAspect(aspect);
	},

	toggleAddons: function (list) {
		var self = this;
		list.forEach(function (aspect) {
			self.disableAspect(aspect);
		});
	},

	run: function () {
		var from 	= this.c.$from.val(),
			to 		= this.c.$to.val(),
			steps 	= +this.c.$steps.val(),
			id 		= from + 'to' + to,
			path 	= this.find(from, to, steps),
			stepCount 	= 0,
			loopCount	= 0,
			aspectCount = {};

		path.forEach(function (aspect) {
			loopCount++;

			if (loopCount != 1 && loopCount < path.length) {
				typeof aspectCount[aspect] == 'undefined' && (aspectCount[aspect] = 0);
				aspectCount[aspect]++;
			};

			console.log(aspect);
		})
	},

	resetAspects: function () {
		// Get aspects and combinations according to the selected version
		this.aspects = $.extend(
			[],
			version_dictionary[this.version]['base_aspects']
		);
		this.combinations = $.extend(true,
			{},
			version_dictionary[this.version]['combinations']
		);
		
		// Reset the view
		this.c.$from.select2('destroy');
		this.c.$to.select2('destroy');
		this.c.$addons.empty();
		this.c.$avail.empty();

		var tierAspects = [];
		$.each(this.combinations, function (aspect, value) {
			tierAspects.push(aspect);
		});
		tierAspects = tierAspects.sort(aspectSort);
		this.aspects = this.aspects.concat(tierAspects);

		this.pushAddons(this.aspects, this.combinations)

		this.createAspectsList();

		this.toggleAddons(this.addonAspects);

		var ddData = [];
		this.aspects.forEach(function (aspect) {
			ddData.push({text: aspect, id: aspect});
		});
		ddData.sort(ddDataSort);

		this.initSelect2(this.c.$from, ddData, 'air');
		this.initSelect2(this.c.$to, ddData, 'air');

		this.createCombinations();
	},

	createAspectsList: function () {
		var self = this;
		this.aspects.forEach(function (aspect) {
			
			var $aspect = $('<li class="aspect"><img><div class="aspect-text"><h4></h4><div class="desc"></div></div></li>');
			
			$aspect.
				attr('id', aspect)
				.find('img')
					.attr('src', 'aspects/color/' + translate[aspect] + '.png')
				.next()
				.find('h4')
					.text('alskdjfalskdjflaskdfj')
				.next()
					.text('asdjflakdfj');

			$aspect.appendTo(self.c.$avail);
		});
	},

	initSelect2: function (element, data, value) {
		
		function format (d) {
			var aspect = d.id;
			return '<div class="aspect" id="'+aspect+'"><img style="margin: 4px 5px 0 0" src="aspects/color/' + translate[aspect] + '.png" /><div>' + translate[aspect] + '</div><div class="desc">' + aspect + '</div></div>'
		}

		$(element).select2({
			data: data,
			formatResult: format,
			formatSelection: format,
			allowClear: false,
			sortResults: function (results, container, query) {
				return results.sort(function (a, b) {
					return translate[a.id].localeCompare(translate[b.id]);
				});
			},
			matcher: function (search, text) {
				return text.toUpperCase().indexOf(search.toUpperCase())>=0 || translate[text].toUpperCase().indexOf(search.toUpperCase()) >= 0;
			}
		});

		$(element).select2('val', value);
	},

	createCombinations: function () {
		this.graph = {};

		for( var compound in this.combinations) {
			this.connect(compound, this.combinations[compound][0]);
			this.connect(compound, this.combinations[compound][1]);
		}
	},

	setVersions: function () {
		var self = this;
		$.each(version_dictionary, function (key, version) {
			$('<option />')
				.val(key)
				.text(key)
				.appendTo(self.c.$version);
		});
		self.c.$version.val(self.version);
	},

	whatchForViewChanges: function () {
		var self = this;
		
		$('#find_connection').on('click', function (e) {
			self.run();
		});

		self.c.$addons.on('change', '.addon_toggle', function () {
			var $this = $(this),
				addon = $this.attr('id');
			if ( $this.is(':checked') )
				addon_dictionary[addon]['aspects'].forEach(function (aspect) {
					self.enableAspect('#'+aspect);
				});
			else 
				addon_dictionary[addon]['aspects'].forEach(function (aspect) {
					self.disableAspect('#'+aspect);
				});
		});

		$('#sel_all').on('click', function () {
			self.aspects.forEach(function (aspect) {
				self.enableAspect('#' + aspect); 
			});
		});

		$('#desel_all').on('click', function () {
			self.aspects.forEach(function (aspect) {
				self.disableAspect('#' + aspect); 
			});
		});

		$('#version').on('change', function () {
			var $this = $(this);
			self.version = $this.val();
			self.resetAspects();
		});

		self.c.$avail.on('click', '.aspect', function () {
			self.toggle(this);
		});

	},

	init: function () {
		this.setVersions();
		this.whatchForViewChanges();

		this.resetAspects();
	}


}

tcresearch.init();

/**
 * Sorting functions
 */
function aspectSort (a, b) {
	return (a == b) ? 0 : (translate[a] < translate[b]) ? -1 : 1;
}
function ddDataSort (a, b) {
	return (a.text == b.text) ? 0 : (translate[a] < translate[b]) ? -1 : 1;
}

/**
 * Helper functions
 */
function getWeight (aspect) {
	return $('#' + aspect).hasClass('unavail') ? 100 : 1;
}

