/**
 * @author Гудов Илья
 *
 */
var svgBoxPlot = (function(){
	/**********************/
	/* Foreign functions  */
	/**********************/

	Array.prototype.max = function() {
	  return Math.max.apply(null, this);
	};

	Array.prototype.min = function() {
	  return Math.min.apply(null, this);
	};
	Array.prototype.sortNumbers = function(){
		return this.sort(function(a,b){return a-b;});
	}
	
	//-- Cross browser method to get style properties:
    function _getStyle(el, property) {
        if ( window.getComputedStyle ) {
            return document.defaultView.getComputedStyle(el,null)[property];
        }
        if ( el.currentStyle ) {
            return el.currentStyle[property];
        }
    }
	// Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.18
	// Ссылка (en): http://es5.github.io/#x15.4.4.18
	// Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.18
	if (!Array.prototype.forEach) {

	  Array.prototype.forEach = function (callback, thisArg) {

	    var T, k;

	    if (this == null) {
	      throw new TypeError(' this is null or not defined');
	    }

	    // 1. Положим O равным результату вызова ToObject passing the |this| value as the argument.
	    var O = Object(this);

	    // 2. Положим lenValue равным результату вызова внутреннего метода Get объекта O с аргументом "length".
	    // 3. Положим len равным ToUint32(lenValue).
	    var len = O.length >>> 0;

	    // 4. Если IsCallable(callback) равен false, выкинем исключение TypeError.
	    // Смотрите: http://es5.github.com/#x9.11
	    if (typeof callback !== 'function') {
	        throw new TypeError(callback + ' is not a function');
	    }

	    // 5. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
	    if (arguments.length > 1) {
	      T = thisArg;
	    }

	    // 6. Положим k равным 0
	    k = 0;

	    // 7. Пока k < len, будем повторять
	    while (k < len) {

	      var kValue;

	      // a. Положим Pk равным ToString(k).
	      //   Это неявное преобразование для левостороннего операнда в операторе in
	      // b. Положим kPresent равным результату вызова внутреннего метода HasProperty объекта O с аргументом Pk.
	      //   Этот шаг может быть объединён с шагом c
	      // c. Если kPresent равен true, то
	      if (k in O) {

	        // i. Положим kValue равным результату вызова внутреннего метода Get объекта O с аргументом Pk.
	        kValue = O[k];

	        // ii. Вызовем внутренний метод Call функции callback с объектом T в качестве значения this и
	        // списком аргументов, содержащим kValue, k и O.
	        callback.call(T, kValue, k, O);
	      }
	      // d. Увеличим k на 1.
	      k++;
	    }
	    // 8. Вернём undefined.
	  };
	}

	/* End of foreign functions */
	/****************************/

	/* Necessary data */
	var data = [];
	/* Number of input arrays */
	var _NumberOfInputArrays = 0;
	/* Vertical values */ 
	var _Values = [];
	/* Vertical positions for horizontal lines and values */
	var _verticalOffsets = new Array();
	
	/* init Svg coordinates for Inner graph */
	var _initSvgY = 40;
	var _initSvgX = 40;
	var _bottomHeight = 40;
	/* Svg dimensions */
	var svgHeight = "300";
	var _innerSvgHeight = svgHeight-_initSvgY-_bottomHeight;
	var svgWidth  = "500";
	var _innerSvgWidth = svgWidth-_initSvgX;

	var _oneBoxWidth = 200; 		/* Ширины квадрата */
	var _oneBoxBorder = 100;   /* Отступ слева */

	/* Горизонтальные начальные координаты каждого бокса */
	var _horOneBoxCoordinates = []; /* Координаты будут выставляться по порядку (координаты по X) */
	/* Ширина блоков */
	var _oneBoxesWidths = []; /* Указаны по порядку (ширина каждого бокса с усами:)) */
	/* Названия графиков */ 
	var _horNamesOfBoxes      = []; /* Названия графиков будут идти по порядку (название каждого бокса) */
 	/* Equality values sto pixels */
 	var _oneValueToPx = 1;			/* Количество пикселей на одно значение входных параметров (по вертикали) */

	var _numberOfHorizontalLines = 5;
	var _step = 0;
	var _stepInPx = 0;
	var NS = "http://www.w3.org/2000/svg";

	/* Path lines params */
	var _fillArrayOptipon  = ['fill', 'white'];
	var _strokeArrayOption = ['stroke', 'black'];
	var _strokeArrayWidthOption = ['stroke-width', '1'];
	var _class = ['class', 'colorElement']


	/* Description ids */
	var _descriptionDivOuterId = "mustacheDescriptionDiv";
	var _descriptionDivInnerId = "mustacheDescriptionDivInner";
	var _descriptionButtonId   = "mustacheDescriptionHideShowButton";
	var _descriptionTableId    = "mustacheDescriptionTable";


	/* Different background colors in box items */
	var _randomBackgroundFlag = true;
	var _arrayWithBackgroundColors = ['#ffffff', '#000000'];
	var _arrayWithSelectedBackgroundColor = [];
	/* Supporting functions */
	/**
	 * get document object (element) and sets attributes and values to this element
	 * @var element - document object
	 * @var attributes - array of arrays - disign = [['attribute', 'value']]
	 * @return element 
	 */
	function setAttributes(element, attributes) {
		attributes.forEach(function(item, i, attr) {
			element.setAttribute(item[0], item[1]);
		});
		return element;
	}

	/**
	* Gets random integer number
	* @var min - number (int)
	* @var max - number (int)
	* @return  - number (int)
	*/
	function getRandomInt(min, max) {
		return Math.floor(Math.random()*(max-min+1) +min);
	}
	/**
	* Creates random color
	* @return string - params of color
	*/
	function getRandomColor() {
		var possibleValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b' , 'c', 'd', 'e', 'f'];
		var maxValue       = possibleValues.length;
		var color          = "#";
		for(var i=0; i<6; i++) {
			color+=possibleValues[getRandomInt(0, maxValue-1)];
		}
		return color;
	}
	/**
	* Creates random color and checks if color is exists in _arrayWithBackgroundColors 
`	* @return string - color
	*/
	function getRandomBackgroundColor() {
		var newColor = getRandomColor();;
		if( _arrayWithBackgroundColors.indexOf(newColor) >= 0 ) {
			return getRandomBackgroundColor();
		} else{
			_arrayWithBackgroundColors.push(newColor);
			_arrayWithSelectedBackgroundColor.push(newColor);
			return newColor;	
		}
	}
	/* Supporting functions END */

	/**
	* Функция инициализации параметров
	* здесь определяется ширины одного квадрата
	* количество квадратов
	* названия квадратов
	* задаются значения параметрам
	**/
	function initData(inputData) {
		var numberOfBoxes = inputData.length;
		var initHorCoordinate = 0;
		var lastCoordinate = 0;
		if(numberOfBoxes == 1) {
			_oneBoxWidth = 100;
			_oneBoxBorder = 20;
			initHorCoordinate = (svgWidth/2)-(_oneBoxWidth/2);
			_horOneBoxCoordinates.push(initHorCoordinate);
			_oneBoxesWidths.push(_oneBoxWidth);
			_horNamesOfBoxes.push(inputData[0].shift());
		} else{
			var numberOfElements = inputData.length; /* Number of arrays in input data */
			var oneBoxBorder  = 1/numberOfElements*_oneBoxBorder;
			var oneBoxWidth        = svgWidth/numberOfElements - (2*oneBoxBorder);
			_oneBoxWidth      = oneBoxWidth;
			inputData.forEach(function(item, i,arr){
				_horNamesOfBoxes.push(item.shift());
				//var oneBoxWidth      = _oneBoxWidth/inputData.length;
				//var oneBoxBorder     = _oneBoxBorder/inputData.length;
				if(i==0) { initHorCoordinate = _oneBoxBorder;}else{
				initHorCoordinate = lastCoordinate+oneBoxBorder+oneBoxWidth;}
				lastCoordinate    = initHorCoordinate;
				_horOneBoxCoordinates.push(initHorCoordinate);
				_oneBoxesWidths.push(oneBoxWidth);
			});
		}
		/*alert(_horOneBoxCoordinates.join(', '));*/
		return true;
	}

	function buildVerticalVelues(min, max) {
		var values = new Array();
		var initValue = (min-_step)<0 ? 0 : (min-_step);
		for(var i=0; i<_numberOfHorizontalLines+3; i++) {
			values.push(initValue);
			initValue+=_step;
		}
		return values;
	}
	function buildVertAxisItem(itemValue, itemNumber){
		/*alert('Номер '+itemNumber+'  Значение '+ itemValue);*/

		var itemYoffset = _initSvgY+(_innerSvgHeight-(itemValue*_oneValueToPx));
		/*console.log(_innerSvgHeight);
		console.log((itemValue*_oneValueToPx));*/		
		console.log("Значение   "+itemValue);
		console.log("Смещение Y "+itemYoffset);
		
		_verticalOffsets['itemNumber']=itemYoffset;
		/*var item = "<text x='0' y='"+itemYoffset+"' font-family='Verdana' font-size='12'>"+itemValue+"</text>";*/
		var item = document.createElementNS(NS,'text');
		item.setAttribute('x', 0);
		item.setAttribute('y', itemYoffset);
		item.setAttribute('font-family', 'Verdana');
		item.setAttribute('font-size', 12);
		item.innerHTML = itemValue; 
		return item;
	}
	/**
	 * @var min - минимальное знаение данных
	 * @var max - максимальное значение данных
	 * @return - g элемент с вертикальными элементами
	 */ 
	function buildVerticalAxis(min, max, _numberOfHorizontalLines) {
		_step = Math.round(max/_numberOfHorizontalLines);
		_stepInPx = _innerSvgHeight/(_numberOfHorizontalLines+1);
		//alert(min);
		//alert(max);alert(step);
		_Values = buildVerticalVelues(min, max);
		/* Calculating number of pixels equal to one point of value */
		_oneValueToPx = _innerSvgHeight/_Values[_Values.length-1];
		/*
		console.log(_innerSvgHeight);
		console.log(_Values[_Values.length-1]);
		console.log("Количество пикселей на одно значение - "+_oneValueToPx);
		*/
		var vertAxis = "";
		var vertAxisElement = document.createElementNS(NS,'g');
		vertAxisElement.setAttribute('id', 'vertAxis');
		/*_Values.forEach(function(item, i, arr) {
				vertAxis=buildVertAxisItem(item, i);
				vertAxisElement.appendChild(vertAxis);
		});*/
		var itemsNumber = _Values.length-1;
		for(var i=0; i<_Values.length; i++){
			vertAxis=buildVertAxisItem(_Values[i], itemsNumber);
			vertAxisElement.appendChild(vertAxis);
			itemsNumber--;
		}
		return vertAxisElement;
	}
	/**
	 * Функция строит вертикальную линию (ординат)
	 */
	function buildVerticalAxisPath(){
		var verticalLine = document.createElementNS(NS, 'path');
		verticalLine.setAttribute('stroke', 'black');
		verticalLine.setAttribute('stroke-width', '1');
		var stPtx = 40;
		var stPty = _initSvgY;
		var ePtY  = _initSvgY+_innerSvgHeight;
		var d     = "M "+stPtx+" "+stPty+" L "+stPtx+" "+stPty+" L "+" "+stPtx+" "+ePtY+" z";
		verticalLine.setAttribute('d', d);
		verticalLine.setAttribute('class', 'axis');
		return verticalLine;
	}

	function findMinData(inputData) {
		var min = 0;
		if( inputData.constructor == Array ){
			if( inputData[0].constructor == Array ){
				_NumberOfInputArrays = inputData.length;
				var tempArray = new Array();
				for(var i=0; i<_NumberOfInputArrays; i++) {
					tempArray.push(inputData[i].min());
				}
				min = tempArray.min();
			}
			else{
				_NumberOfInputArrays = 1;
				min = inputData.min();
			}
		} else { alert('Входные данные не являются массивом '); }
		return min;
	}

	function findMaxData(inputData) {
		var max = 0;
		if( inputData.constructor == Array ){
			if( inputData[0].constructor == Array ){
				var tempArray = new Array();
				for(var i=0; i<_NumberOfInputArrays; i++) {
					tempArray.push(inputData[i].max());
				}
				max = tempArray.max();
			}
			else{
				max = inputData.max();
			}
		} else { alert('Входные данные не являются массивом '); }
		return max;
	}


	/* Bottom axis */ 
	function buildBottomAxisPath(){
		var horizontalLine = document.createElementNS(NS, 'path');
		horizontalLine.setAttribute('stroke', 'black');
		horizontalLine.setAttribute('stroke-width', '1');
		var bottomAxisLength = svgWidth-40;
		var bottomStartPoint = _initSvgY;
		var bottomVerticalStartingPoint = _initSvgY+_innerSvgHeight;
		var bottomPathDOption = "M "+bottomStartPoint+" "+bottomVerticalStartingPoint+" L "+bottomStartPoint+" "+bottomVerticalStartingPoint+" L "+svgWidth+" "+bottomVerticalStartingPoint+" z";
		horizontalLine.setAttribute('d', bottomPathDOption);
		horizontalLine.setAttribute('class', 'axis');
		return horizontalLine;
	}



	/* Builind box pot Item */
	function findMedian(array) {
		var m=array;
	    var middle = Math.floor((m.length - 1) / 2); // NB: operator precedence
	    if (m.length % 2) {
	        return m[middle];
	    } else {
	        return (m[middle] + m[middle + 1]) / 2.0;
	    }
	}
	function calculateStatisticsForItem(itemDataArray) {
		var sorted = itemDataArray.sortNumbers();
		var median = findMedian(sorted);
		/*console.log(median);*/
		var middle = Math.floor((sorted.length-1) / 2);
		var q1     = findMedian(sorted.slice(1, middle));
		var q3     = findMedian(sorted.slice(middle));
		var min    = sorted.min();
		var max    = sorted.max();
		var calculatedValuesObject={
			median : median,
			q1     : q1,
			q3     : q3,
			min    : min,
			max    : max
		};
		return calculatedValuesObject;
	}

	/**
	*  6 steps for creating square element
	*  1) top horizontal element          - function createTopHorizontalElement
	*  2) top vertical element            - function createTopVerticalElement
	*  3) create square element           - function createSquareElement
	*  4) create middle element  		  - function createMiddleElement
	*  5) create bottom vertical element  - function createBottomElement
	*  6) crate bottom horizontal element - function createBottomHorizontalElement
	*/

	/** 
	 * Builds top horizontal element with some parameters
	 * @var elementParams - object (min, max, q1,q3, middle)
	 * @return tpHrEl - document object path
	 */
	function createTopHorizontalElement(maximum, middleCoordinate, numberOfElement) {
		var topHorizontalElement = document.createElementNS(NS, 'path');
		var tpHrPsMx   = _initSvgY+(_innerSvgHeight-(maximum * _oneValueToPx));
		/*<path fill="white" stroke="black" stroke-width="1" d="M 54 50 L 54 50 L 66 50 z" />*/
		var initHorPosition  = _horOneBoxCoordinates[numberOfElement];
		var initWidth        = _oneBoxesWidths[numberOfElement];
		var hrLineWidth      = 0.1*initWidth;
		var halfWidth        = hrLineWidth/2;
		var leftCoordinate   = initHorPosition+middleCoordinate-halfWidth;
		var rightCoordinate  = initHorPosition+middleCoordinate+halfWidth;
		var topHorizontalElementDimensions = "M "+(leftCoordinate)+" "+tpHrPsMx+" L "+(leftCoordinate)+" "+tpHrPsMx+" L "+(rightCoordinate)+" "+tpHrPsMx+" z";
		var topHorizontalElementOptions = [
			_fillArrayOptipon,
			_strokeArrayOption,
			_strokeArrayWidthOption,
			_class,
			['d' , topHorizontalElementDimensions]
		];
		topHorizontalElement.addEventListener('mouseover', function(){
			//console.log("Максимум  - "+maximum);
		});
		setAttributes(topHorizontalElement, topHorizontalElementOptions );
		return topHorizontalElement;
	}	

	/**
	 * Функция строит вертикальную линию от максимума к третьему квартилю
	 * @var max - number
	 * @var q3  - number
	 * @var middleCoordinate - number
	 * @var numberOfElement  - number
	 * @return document element (path)
	 */
	function createTopVerticalElement(max, q3, middleCoordinate, numberOfElement) {
		var topVerticalElement = document.createElementNS(NS, 'path');
		var tpVrPsMx = _initSvgY+(_innerSvgHeight-(max * _oneValueToPx));
		var btVrPsMn = _initSvgY+(_innerSvgHeight-(q3 * _oneValueToPx));
		var middleVerticalElementCoordinate = _horOneBoxCoordinates[numberOfElement]+middleCoordinate;
		/*<path fill="white" stroke="black" stroke-width="1" d="M 60 50 L 60 100 z" />*/
		var tpHrDm  = "M "+middleVerticalElementCoordinate+" "+tpVrPsMx+" L "+middleVerticalElementCoordinate+" "+btVrPsMn+" z";
		var topVerticalElementOptions = [
			_fillArrayOptipon,
			_strokeArrayOption,
			_strokeArrayWidthOption,
			_class,
			['d', tpHrDm]
		];
		topVerticalElement.addEventListener('mouseover', function(){
			/* console.log("Максимум  - q3"+(max-q3)); */
		});
		setAttributes(topVerticalElement, topVerticalElementOptions);
		return topVerticalElement;
	}

	/**
	 * Функция строит прямоугольный элемент графика
	 * @var q1 - number
	 * @var q3 - number
	 * @var elementNumber - number
	 * @return document element (path)
	 */
	function crateSquarePathElement(q3, q1, elementNumber) {
		var squareElement = document.createElementNS(NS, 'path');
		/*<path fill="white" stroke="black" stroke-width="1" d="M 10 100 l 0 100 l 100 0 L 110 100 z" />*/
		var initHorCoordinate = _horOneBoxCoordinates[elementNumber];
		var initRightCoordinate = (initHorCoordinate+_oneBoxesWidths[elementNumber]);
		var topSqCoordinate = _initSvgY+(_innerSvgHeight - (q3 * _oneValueToPx));
		var bottomSqCoordinate = _initSvgY+(_innerSvgHeight - (q1*_oneValueToPx));

		/* M x y - начальная точка */
		var sqElM = " M "+initHorCoordinate+" "+topSqCoordinate;
		
		var leftTopCorner = " L "+initHorCoordinate+" "+ topSqCoordinate;
		var rightTopCorner = " L "+initRightCoordinate+" "+topSqCoordinate;

		var leftBottomCorner = " L "+initHorCoordinate+" "+bottomSqCoordinate;
		var rightBottomCorner = " L "+initRightCoordinate+" "+bottomSqCoordinate;

		var squareDimensions = sqElM+" "+leftTopCorner+" "+rightTopCorner+" "+rightBottomCorner+" "+leftBottomCorner+" z";
		console.log('square dimensions - '+squareDimensions);
		var squareElementOptions = [
			_fillArrayOptipon,
			_strokeArrayOption,
			_strokeArrayWidthOption,
			_class,
			['d', squareDimensions]
		];
		setAttributes(squareElement, squareElementOptions);
		return squareElement;		
	}

	/**
	 * Creates middle median element (path)
	 * @var middle - number
	 * @var elementNumber - number
	 * @return medianElement - document object (path)
	 */
	 function createMedianElement(middleCoordinate, elementNumber) {
	 	var medianElement = document.createElementNS(NS, 'path');
	 	var verticalCoordinate = _initSvgY+(_innerSvgHeight - (middleCoordinate * _oneValueToPx));
	 	var leftHorCoordinate  = _horOneBoxCoordinates[elementNumber];
	 	var rightHorCoordinate = _horOneBoxCoordinates[elementNumber] + _oneBoxesWidths[elementNumber];
	 	var mdElDm = "M "+leftHorCoordinate+" "+verticalCoordinate+" L "+leftHorCoordinate+" "+verticalCoordinate+" L "+rightHorCoordinate+" "+verticalCoordinate+" z";
	 	var medianElementOptions = [
	 		_fillArrayOptipon,
	 		_strokeArrayOption,
	 		_strokeArrayWidthOption,
	 		_class,
	 		['d', mdElDm]
	 	];
	 	setAttributes(medianElement, medianElementOptions);
	 	return medianElement;
	 }

	/**
	 * Creates bottom vertical element
	 * @var q1 - number
	 * @var min - number
	 * @middleCoordinate - number
	 * @elementNumber - number
	 * @return bottomVerticalElement - document object
	 */
	function createBottomVerticalElement(q1, min, middleCoordinate, elementNumber) {
		var bottomVerticalElement=document.createElementNS(NS, 'path');
		var btVtElMx = _initSvgY+(_innerSvgHeight-(q1 * _oneValueToPx));
		var btVtElMn = _initSvgY+(_innerSvgHeight-(min * _oneValueToPx));
		var middleVerticalElementCoordinate = _horOneBoxCoordinates[elementNumber]+middleCoordinate;
		/*<path fill="white" stroke="black" stroke-width="1" d="M 60 50 L 60 100 z" />*/
		var btVtElDm  = "M "+middleVerticalElementCoordinate+" "+btVtElMx+" L "+middleVerticalElementCoordinate+" "+btVtElMn+" z";		
		var bottomVerticalElementOptions = [
			_fillArrayOptipon,
			_strokeArrayOption,
			_strokeArrayWidthOption,
			_class,
			['d', btVtElDm]
		];
		setAttributes(bottomVerticalElement, bottomVerticalElementOptions);
		return bottomVerticalElement;
	}

	/**
	 * Creates bottom horizontal element
	 * @var min - number
	 * @var middleCoordinate - number
	 * @var elementNumber - number
	 * @return bottomHorElement - document object (path)
	 */
	 function createBottomHorizontalElement(min, middleCoordinate, elementNumber) {
	 	var bottomHorElement = document.createElementNS(NS, 'path');
	 	var btHrElPs   = _initSvgY+(_innerSvgHeight-(min * _oneValueToPx));
		/*<path fill="white" stroke="black" stroke-width="1" d="M 54 50 L 54 50 L 66 50 z" />*/
		var initHorPosition  = _horOneBoxCoordinates[elementNumber];
		var initWidth        = _oneBoxesWidths[elementNumber];
		var hrLineWidth      = 0.1*initWidth;
		var halfWidth        = hrLineWidth/2;
		var leftCoordinate   = initHorPosition+middleCoordinate-halfWidth;
		var rightCoordinate  = initHorPosition+middleCoordinate+halfWidth;
		var bottomHorizontalElementDimensions = "M "+(leftCoordinate)+" "+btHrElPs+" L "+(leftCoordinate)+" "+btHrElPs+" L "+(rightCoordinate)+" "+btHrElPs+" z";
		var bottomHorizontalElementOptions = [
			_fillArrayOptipon,
			_strokeArrayOption,
			_strokeArrayWidthOption,
			_class,
			['d' , bottomHorizontalElementDimensions]
		];
		setAttributes(bottomHorElement, bottomHorizontalElementOptions );
	 	return bottomHorElement;
	 }

	 /**
	 * Creates bottom text element
	 * @var middle coordinate - number
	 * @var elementNumber - number
	 * @return object - document object (text)
	 */
	 function createBottomTextElement(middleCoordinate, elementNumber) {
	 	var btTextEl = document.createElementNS(NS, 'text');
	 	var initHorPosition = middleCoordinate	;
	 	var initVrPosition  = _initSvgY+_innerSvgHeight+15;

	 	initHorPosition = _horOneBoxCoordinates[elementNumber]+middleCoordinate-2;


	 	/*var span = document.createElement('span');
	 	span.setAttribute('class', 'hrSpan');
	 	span.setAttribute('style', "width:"+_oneBoxesWidths[elementNumber]+"px;");
	 	span.innerHTML=_horNamesOfBoxes[elementNumber];
	 	*/
	 	/*<text x="80" y="480" font-family="Verdana" font-size="12">Text</text>	*/
	 	var btTextElOptions = [
	 	['x', initHorPosition],
	 	['y', initVrPosition],
	 	['font-family', 'Verdana'],
	 	['font-size', 12],
	 	['width', _oneBoxesWidths[elementNumber]],
	 	['text-anchor', 'middle']
	 	];
	 	/*if(_horNamesOfBoxes[elementNumber].length*12>_oneBoxesWidths[elementNumber]) {
	 		var initXPoint = _horOneBoxCoordinates[elementNumber]+middleCoordinate;
	 		var initVrPosition = initVrPosition+(12/2);
	 		btTextElOptions.push(['transform', 'rotate(3 '+initXPoint+', '+initVrPosition+')']);	
	 	}*/
	 	btTextEl.innerHTML = _horNamesOfBoxes[elementNumber];
	 	btTextEl.innerHTML = elementNumber+1;
	 	setAttributes(btTextEl, btTextElOptions);
	 	return btTextEl;
	 }

	 /**
	 * Builds horizontal rows
	 * @return object - path elements
	 */
	 function buildHorizontalRows() {
	 	var horizontalRows = document.createElementNS(NS, 'g');
	 	var horizontalRow  = "";
	 	for(var i=0;i<_Values.length; i++) {
	 		horizontalRow = document.createElementNS(NS, 'path');
	 		var iMX = 40;
	 		var eMX = svgWidth;
	 		var iY  = _initSvgY+(_innerSvgHeight-(_oneValueToPx*_Values[i]));
	 		var currentValue = _Values[i];
	 		console.log(iY);
	 		var d   = "M "+iMX+" "+iY+" L "+iMX+" "+iY+" L "+eMX+" "+iY+" z";
	 		var horizontalRowOptions = [
			 	_fillArrayOptipon,
				_strokeArrayOption,
				_strokeArrayWidthOption,
				['class', 'horizontalRow'],
				['d' , d]
	 		];
	 		setAttributes(horizontalRow, horizontalRowOptions);
	 		horizontalRow.addEventListener('mouseover', function(){
	 			console.log(currentValue);
	 		});
	 		horizontalRows.appendChild(horizontalRow);
	 	}
	 	return horizontalRows; 
	 }

	 function createTSpan(value) {
	 	var tspan = document.createElementNS(NS, 'tspan');
	 	tspan.innerHTML  = value;
	 	return tspan;
	 }

	 /**
	 * Builds square path by coordinates 
	 */
	 function buildSquare(initX, initY, width, height, className) {
	 	var commonSquare = document.createElementNS(NS, 'path');
	 	console.log("initX - "+initX+" initY - "+initY+" width - "+width+" height - "+height);
	 	if(className==undefined) { className=""; }
	 	var M = "M "+initX+" "+initY;
	 	var L1 = " L "+initX+" "+initY;
	 	var L2 = " L "+(initX+width)+" "+initY;
	 	var L3 = " L "+(initX+width)+" "+(initY+height);
	 	var L4 = " L "+initX+" "+(initY+height);
	 	var d  = M+L1+L2+L3+L4+" z";
	 	console.log(d);
	 	var commonSquareOptions = [
	 		['d', d],
	 		['class', className]
	 	];
	 	setAttributes(commonSquare, commonSquareOptions);
	 	return commonSquare;
	 }
	/**
	* Builds info layer for one item 
	*/
	function buildInfoLayerForItem(itemInfo, elementNumber) {
		var groupElement = document.createElementNS(NS, 'g');
		var textheight = 85;
		var leftPosition  = _horOneBoxCoordinates[elementNumber];
		var topPosition = _initSvgY+(_innerSvgHeight-(_oneValueToPx*itemInfo.max))-textheight-5;
		var maxLengthSpan = "Минимум          - "+itemInfo.max+"";
		var maxWidth      = maxLengthSpan.length*8;
		/* var square       = buildSquare(initX, initY, width, height); */
		if( (leftPosition+maxWidth) > svgWidth ) {
			var difference = (leftPosition+maxWidth) - svgWidth;
			leftPosition = leftPosition - (difference+1);
		}
		var square       = buildSquare(leftPosition, topPosition, (maxWidth), textheight, 'infoSquare');
		var	inner = "<tspan style='font-style:italic;'>"+_horNamesOfBoxes[elementNumber]+"</tspan>";
		inner+= "<tspan x='"+(leftPosition+5)+"' dy='15'>Максимум</tspan><tspan x='"+(leftPosition+5+130)+"'>"+itemInfo.max+"</tspan>";
		inner+= "<tspan x='"+(leftPosition+5)+"' dy='12'>Верхний квартиль</tspan><tspan x='"+(leftPosition+5+130)+"'>"+itemInfo.q3+"</tspan>";
		inner+= "<tspan x='"+(leftPosition+5)+"' dy='12'>Медиана</tspan><tspan x='"+(leftPosition+5+130)+"'>"+itemInfo.median+"</tspan>";
		inner+= "<tspan x='"+(leftPosition+5)+"' dy='12'>Нижний квартиль</tspan><tspan x='"+(leftPosition+5+130)+"'>"+itemInfo.q1+"</tspan>";
		inner+= "<tspan x='"+(leftPosition+5)+"' dy='12'>Минимум</tspan><tspan x='"+(leftPosition+5+130)+"'>"+itemInfo.min+"</tspan>";
		var text = document.createElementNS(NS, 'text');
		text.innerHTML = inner;
		var textOptions = [
			['x', leftPosition+5],
			['y', topPosition+15],
			['font-size', 12]
		];	
		setAttributes(text, textOptions);

		var groupElementOptions   = [
			['class', 'infoLayerDiv'],
			['id', 'ItemInfoNumber'+elementNumber]
		];
		setAttributes(groupElement, groupElementOptions);
		groupElement.appendChild(square);
		groupElement.appendChild(text);
		/*groupElement.appendChild(text);*/
		return groupElement;
	}
	/**
	 * Function gets array parameter
	 * and return g element with some positioning
	 */
	function buildOneBoxPlotItem(item, i) {

		/* First of all - need to calculate element values min, max, quartile, median */
		var __min, __max, __q1, __q3, __median;
		var calculatedValuesForItem = calculateStatisticsForItem(item);
		
		calculatedValuesForItem.number = i;
		var boxElementWrapper = document.createElementNS(NS, 'g');

		var boxPlotElement = document.createElementNS(NS, 'g');
		boxPlotElement.setAttribute('class', 'oneItemElementG');

		/* Calculating some parameters */ 
		var initWidth        = _oneBoxesWidths[i];
		var middleCoordinate = initWidth/2;

		if(_randomBackgroundFlag == true) {
			fillColor = getRandomBackgroundColor();
		} else { fillColor = ""; }

		/* Top horizontal item */
		var topHorizontalElement = createTopHorizontalElement(calculatedValuesForItem.max, middleCoordinate, i);
		boxPlotElement.appendChild(topHorizontalElement);
		
		/* Top vertical item */
		var topVerticalElement   = createTopVerticalElement(calculatedValuesForItem.max, calculatedValuesForItem.q3, middleCoordinate, i);
		boxPlotElement.appendChild(topVerticalElement);

		/* Create square element */
		var squareElement  = crateSquarePathElement(calculatedValuesForItem.q3, calculatedValuesForItem.q1, i);
		squareElement.style.fill = fillColor;
		squareElement.style.opacity = '0.5';
		boxPlotElement.appendChild(squareElement);

		/* Create median element */
		var medianElement = createMedianElement(calculatedValuesForItem.median, i);
		boxPlotElement.appendChild(medianElement);
		
		/* Create bottom vertical element */
		var bottomVerticalElement = createBottomVerticalElement(calculatedValuesForItem.q1, calculatedValuesForItem.min, middleCoordinate, i);
		boxPlotElement.appendChild(bottomVerticalElement);

		/* Create bottom horizontal element */
		var bottomHorizontalElement = createBottomHorizontalElement(calculatedValuesForItem.min, middleCoordinate, i);
		boxPlotElement.appendChild(bottomHorizontalElement);

		/* Create text bottom text element */
		var bottomTextElement = createBottomtextElement = createBottomTextElement(middleCoordinate, i);
		boxPlotElement.appendChild(bottomTextElement);


		boxElementWrapper.appendChild(boxPlotElement);

		/* Build info layer for one item */
		var infoLayerForItem = buildInfoLayerForItem(calculatedValuesForItem, i);
		boxElementWrapper.appendChild(infoLayerForItem);


		boxPlotElement.addEventListener('mouseover', function(){
			var oneItemId   = "ItemInfoNumber"+i;
			var infoElement = document.getElementById(oneItemId);
			display         = _getStyle(infoElement, 'display');
			if( display == 'none'){
				infoElement.style.display='block';
				
			} else{
				infoElement.style.display='none';
				
			}
			return 0;
		});
		
		boxPlotElement.addEventListener('mouseout', function(){
			var oneItemId   = "ItemInfoNumber"+i;
			var infoElement = document.getElementById(oneItemId);
			display         = _getStyle(infoElement, 'display');
			if( display == 'none'){
				infoElement.style.display='block';
				
			} else{
				infoElement.style.display='none';
				
			}
			return 0;
		});

		return boxElementWrapper;
	}

	/**
	* Creates button with some listeners
	* @return button object;
	*/
	function createHideShowDescriptionButton() {
		var button = document.createElement('button');
		var showString = "Открыть описание";
		var hideString = "Скрыть описание";
		var bOptions = [
			['id', _descriptionButtonId]
		];
		setAttributes(button, bOptions);
		button.innerHTML = showString;
		button.addEventListener('click', function(){
			var innerDescriptionDiv = document.getElementById(_descriptionDivInnerId);
			display         = _getStyle(innerDescriptionDiv, 'display');
			if( display == 'none'){
				innerDescriptionDiv.style.display='block';
				button.innerHTML = hideString;
			} else{
				innerDescriptionDiv.style.display='none';
				button.innerHTML = showString;
			}
		});
		return button;
	}

	/**
	* Creates inner html
	* @return object - html table object
	*/
	function createDescriptionInnerHTML() {
		var descriptionInnerHTML = document.createElement('table');
		for(i=0; i<_horNamesOfBoxes.length; i++) {
			var innerString = document.createElement('tr');
			innerString.innerHTML = "<td>"+(i+1)+"</td><td>"+_horNamesOfBoxes[i]+"</td>";
			var floatingDescriptionDivId = "ItemInfoNumber"+i;
			var floatingDescriptionDiv   = document.getElementById(floatingDescriptionDivId);
			console.log(floatingDescriptionDivId);
			innerString.style.backgroundColor = _arrayWithSelectedBackgroundColor[i];
			innerString.style.opacity = '0.9';
			descriptionInnerHTML.appendChild(innerString);
			innerString.addEventListener('mouseover', function() {
				alert(floatingDescriptionDivId);
			var display         = _getStyle(floatingDescriptionDiv, 'display');
				if( display == 'none' ) {
					floatingDescriptionDiv.style.display='block';
				} else {
					floatingDescriptionDiv.style.display='none';
				}
			});
			
		}
		descriptionInnerHTMLOptions = [
			['id', _descriptionTableId]
		];
		setAttributes(descriptionInnerHTML, descriptionInnerHTMLOptions);
		return descriptionInnerHTML;
	}
	/**
	* Creates inner description div
	* @return innerDescriptionDiv - html object
	*/
	function createInnerDescriptionDiv() {
		var innerDescriptionDiv = document.createElement('div');
		var innerDescriptionDivOptions = [
			['id', _descriptionDivInnerId]
		];
		setAttributes(innerDescriptionDiv, innerDescriptionDivOptions);

		innerDescriptionDiv.appendChild(createDescriptionInnerHTML());
		return innerDescriptionDiv;
	}
	/**
	* Function builds description of items
	* @return object - div html object
	*/
	function buildDescription() {
		var descriptionDiv = document.createElement('div');
		var button         = createHideShowDescriptionButton();
		descriptionDiv.appendChild(button);

		var innerDescriptionDiv = createInnerDescriptionDiv();
		descriptionDiv.appendChild(innerDescriptionDiv);


		var descriptionDivOptions = [
			['id', _descriptionDivOuterId]
		];
		setAttributes(descriptionDiv, descriptionDivOptions);

		return descriptionDiv;
	}
	return {
		/**
		* @var divId - string without sharp
		* @var inputData - array of arrays?
		* @return html - string
		*/
		initBoxPlot : function(divId, inputData) {

			/*
			Нужно посчитать каким образом значения входных данных будут соответствовать значениям пикселей на координатной плоскости
			иными словами сколько значений будет в одном пикселе (например, имеем максимум 10, значит 1 значение будет равно 500/10 = 50 px)
			Итого, если нужно отрисовать максимум - например 5, значит мы берем отсттуп в 5*50px = 500-250px=250px;
			4 - 500-4*50px = 500-200px=300px; и т.д.
			*/

			/* Инициализация основных параметров  */
			initData(inputData);
			var div = document.getElementById(divId);
			var svg = document.createElementNS(NS, "svg");
			svg.setAttribute('width', svgWidth);
			svg.setAttribute('height', svgHeight);
			var min = findMinData(inputData);
			var max = findMaxData(inputData);			
			/* Building vertical axis */
			var leftAxis = buildVerticalAxis(min, max, _numberOfHorizontalLines);
			svg.appendChild(leftAxis);			
			var leftAxisPath = buildVerticalAxisPath();
			svg.appendChild(leftAxisPath);
			var bottomAxisPath = buildBottomAxisPath();
			svg.appendChild(bottomAxisPath);			
			/* Build horizontal rows */
			var horizontalRows = buildHorizontalRows();
			svg.appendChild(horizontalRows);			
			/*alert(_oneValueToPx);*/
			var innerG = document.createElementNS(NS, 'g');
			innerG.setAttribute('class', 'innerG');
			inputData.forEach(function(item,i ,arr){
				innerG.appendChild(buildOneBoxPlotItem(item, i));
			});
			svg.appendChild(innerG);
			var tempDiv = document.createElement('div');

			tempDiv.appendChild(svg);

			/* Building description */
			var description = buildDescription();
			div.appendChild(description);
			div.appendChild(tempDiv);

			return 0;
		}
	}
}());