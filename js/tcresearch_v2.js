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
		$search : $('#search-container'),
		$searchResults: $('#search-results'),
		$resultsWrapper: $('#search-results-wrapper'),
		$combBox:  $('#combination-box'),
		$combBoxL: $('#combination-box #left'),
		$combBoxR: $('#combination-box #right'),
		$combBoxE: $('#combination-box #equals'),
	},

	html: {
		searchResult: '<div class="search-result">'
					+ '<a href="#" class="close-result"><i class="fa fa-trash-o"></i></a>'
					+ '<h2><span class="from"></span> &gt; <span class="to"></span></h2>'
					+ '</div>',
		aspectsList:  '<ul class="aspect-list">'
					+ '</ul>',
		searchAspect: '<li class="aspect">'
					+ '<img />'
					+'<div class="aspect-name"></div>'
					+ '</li>',
		searchInfo:   '<div class="search-info">'
					+ '<p>Total steps: <span class="total-steps"></span></p>'
					+ '<ul class="used-aspects"><li>Used aspects:</li></ul>'
					+ '</div>',
		usedAspect:   '<li class="used-aspect">'
					+ '<img />'
					+ '<span></span>'
					+ '</li>',
		toggleAddon:  '<label class="btn btn-default"><input type="checkbox" class="addon_toggle" /><span></span></label>'
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

			var $addon = $(self.html.toggleAddon);
			$addon
				.find('input')
					.attr('id', key)
				.next()
					.text(addonInfo['name'])
				.parent()
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
				return orig.replace(/mono/, 'color');
			});
	},

	disableAspect: function (aspect) {
		$(aspect)
			.addClass('unavail')
			.find('img')
			.attr('src', function (i, orig) {
				return orig.replace(/color/, 'mono');
			});
	},

	toggle: function (aspect) {
		if ( $(aspect).hasClass('unavail') )
			this.enableAspect(aspect);
		else 
			this.disableAspect(aspect);
	},

	toggleAddons: function (list) {
		var self = this;
		list.forEach(function (aspect) {
			self.disableAspect('#avail #' + aspect);
		});
	},

	run: function () {
		var self 	= this,
			from 	= this.c.$from.val(),
			to 		= this.c.$to.val(),
			steps 	= +this.c.$steps.val(),
			id 		= from + 'to' + to,
			path 	= this.find(from, to, steps),
			stepCount 	= 0,
			loopCount	= 0,
			aspectCount = {};

		var $searchResult = $(self.html.searchResult),
			$aspectsList  = $(self.html.aspectsList),
			$searchInfo   = $(self.html.searchInfo);

		path.forEach(function (aspect) {
			loopCount++;

			if (loopCount != 1 && loopCount < path.length) {
				typeof aspectCount[aspect] == 'undefined' && (aspectCount[aspect] = 0);
				aspectCount[aspect]++;
				stepCount++;
			};

			$(self.html.searchAspect)
				.attr('id', aspect)
				.find('img')
					.attr('src', 'aspects/color/' + translate[aspect] + '.png')
				.next()
					.text(translate[aspect])
				.parent()
				.appendTo($aspectsList);
		});

		$.each(aspectCount, function (aspect, value) {

			if ( ! value ) 
				return;

			$(self.html.usedAspect)
				.find('img')
					.attr('src', 'aspects/color/' + translate[aspect] + '.png')
				.next()
					.text(value)
				.parent()
				.appendTo($searchInfo.find('ul'));
			
		});

		$searchResult
			.find('.from')
				.text(from)
			.next()
				.text(to)
			.parent()
			.after($aspectsList);

		$searchInfo
			.find('.total-steps')
				.text(stepCount);

		$aspectsList
			.after($searchInfo);

		self.c.$searchResults.append($searchResult);
		$searchResult.animate({
			'margin-top': 0,
			opacity: 1
		});
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
					.text(translate[aspect])
				.next()
					.text(aspect);

			$aspect.appendTo(self.c.$avail);
		});
	},

	initSelect2: function (element, data, value) {
		
		function format (d) {
			var aspect = d.id;
			return '<div class="aspect" id="'+aspect+'"><img src="aspects/color/' + translate[aspect] + '.png" /><div class="aspect-name">' + translate[aspect] + '</div><div class="aspect-desc">' + aspect + '</div></div>'
		}

		$(element).select2({
			data: data,
			formatResult: format,
			formatSelection: format,
			allowClear: false,
			placeholder: 'Search by name...',
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
			e.preventDefault();

			if ( ! self.c.$searchResults.children().length ) {
				self.c.$search.removeClass('col-lg-offset-4 col-md-offset-4 col-sm-offset-3');
				self.c.$resultsWrapper.fadeIn();
				$('#close_results').fadeIn();

				setTimeout(function () {
					self.run();
				}, 700);
			} else 
				self.run();
		});

		self.c.$addons.on('change', '.addon_toggle', function () {
			var $this = $(this),
				addon = $this.attr('id');
			if ( $this.is(':checked') ) {
				addon_dictionary[addon]['aspects'].forEach(function (aspect) {
					self.enableAspect('#'+aspect);
				});
				$this.parent().addClass('active');
			} else {
				addon_dictionary[addon]['aspects'].forEach(function (aspect) {
					self.disableAspect('#'+aspect);
				});
				$this.parent().removeClass('active');
			}
		});

		$('#sel_all').on('click', function (e) {
			e.preventDefault();

			self.aspects.forEach(function (aspect) {
				self.enableAspect('#avail #' + aspect); 
			});
			$('.addon_toggle').each(function (idx, el) {
				$(el).attr('checked', true).trigger('change');
			});
		});

		$('#desel_all').on('click', function (e) {
			e.preventDefault();

			self.aspects.forEach(function (aspect) {
				self.disableAspect('#avail #' + aspect); 
			});
			$('.addon_toggle').each(function (idx, el) {
				$(el).attr('checked', false).trigger('change');
			});
		});

		$('#version').on('change', function () {
			var $this = $(this);
			self.version = $this.val();
			self.resetAspects();
		});

		$('#increment').click(function (e) {
			e.preventDefault();
			
			var val = self.c.$steps.val();
			val = +val + 1;
			self.c.$steps.val(val);
		});

		$('#decrement').click(function (e) {
			e.preventDefault();
			
			var val = self.c.$steps.val();
			val = (val > 1) ? +val - 1 : 1;
			self.c.$steps.val(val);
		});

		$('body').on('click', 'a.close-result', function (e) {
			e.preventDefault();

			$(this)
				.parent()
				.slideUp(400, function () {
					this.remove();
					
					if ( ! self.c.$searchResults.children().length ){
						self.c.$search.addClass('col-lg-offset-4 col-md-offset-4 col-sm-offset-3');
						self.c.$resultsWrapper.fadeOut();
						$('#close_results').fadeOut();
					}
				});
			
		});

		$('#show-config').on('click', function (e) {
			e.preventDefault();

			$('#config').slideToggle();
			$(this).toggleClass('active');
			$('#info').slideUp();
			$('#show-info').removeClass('active');
		});
		
		$('#show-info').on('click', function (e) {
			e.preventDefault();

			$('#info').slideToggle();
			$(this).toggleClass('active');
			$('#config').slideUp();
			$('#show-config').removeClass('active');
		});

		$('#close_results').on('click', function (e) {
			e.preventDefault();

			$('.search-result').slideUp('400', function () {
				$(this).remove();

				self.c.$search.addClass('col-lg-offset-4 col-md-offset-4 col-sm-offset-3');
				self.c.$resultsWrapper.fadeOut();
				$('#close_results').fadeOut();
			});
		});

		var primaryAspects = {'fire':1, 'water':1, 'order':1, 'air':1, 'entropy':1, 'earth':1};
		$('body').on('mouseenter', '#avail .aspect, #search-results .aspect', function () {
			
			var aspect = $(this).attr('id');

			if ( aspect in primaryAspects ) {
				self.c.$combBox.hide();
				return;
			}

			var combo = self.combinations[aspect];
			var left = combo[0];
			var right = combo[1];

			self.c.$combBoxL
				.find('img')
				.attr('src', 'aspects/color/' + translate[left] + '.png')
				.next().text(translate[left])
				.next().text(left);
			self.c.$combBoxR
				.find('img')
				.attr('src', 'aspects/color/' + translate[right] + '.png')
				.next().text(translate[right])
				.next().text(right);
			self.c.$combBoxE
				.find('img')
				.attr('src', 'aspects/color/' + translate[aspect] + '.png')
				.next().text(translate[aspect])
				.next().text(aspect);
			self.c.$combBox.css('display', 'inline-block');
		});

		$('body').on('mouseleave', '#avail .aspect, #search-results .aspect', function () {
			self.c.$combBox.hide();
		});

		$('body').on('click', '#search-results .aspect', function () {
			var $this = $(this),
				aspect = $this.attr('id'),
				$h2 = $this.parent().prev(),
				from = $h2.find('.from').text(),
				to = $h2.find('.to').text();
			console.log(from, to, $h2);

			self.c.$from.select2('val', from);
			self.c.$to.select2('val', to);
			self.disableAspect('#' + aspect);
			self.disableAspect('#avail #' + aspect);
			self.run();
			self.enableAspect('#avail #' + aspect);
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
	return $('#avail #' + aspect).hasClass('unavail') ? 100 : 1;
}

