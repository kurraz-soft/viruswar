var cells = [];
$(function(){

    var CELL_AVAILABLE_CLASS = 'available';

    var CellStatus = {
        EMPTY : 'empty',
        RED : 'red',
        RED_Z : 'red_z',
        BLUE : 'blue',
        BLUE_Z : 'blue_z'
    };

    var Cell = function(){
        this.available = 0;
        this.status = CellStatus.EMPTY;
        this.element = null;
    };

    Cell.prototype.setAvailable = function(){
        this.available = 1;
        this.element.addClass(CELL_AVAILABLE_CLASS);
    };

    Cell.prototype.setNotAvailable = function(){
        this.available = 0;
        this.element.removeClass(CELL_AVAILABLE_CLASS);
    };

    Cell.prototype.setStatus = function(status){
        this.status = status;
        for(var p in CellStatus){
            this.element.removeClass(CellStatus[p]);
        }
        this.element.addClass(status);
    };

    var Game = function(){
        this.turn = 1;
        this.step = 1;
        this.player = 'blue';
        this.cellsChecked = [];
    };

    Game.prototype.init = function(){
        fillField(11);
        this.calcAvailability();
    };

    Game.prototype.nextStep = function(){
        this.cellsChecked = [];
        this.step++;
        $('#steps_remains').html(5-this.step+1);
        if(this.step > 5)
        {
            this.nextTurn();
        }
        this.calcAvailability();
    };

    Game.prototype.nextTurn = function(){
        if(this.player == 'red'){
            this.turn++;
            $('#turn').html(this.turn);
        }
        this.step = 1;
        $('#steps_remains').html(5);
        if(this.player === 'blue'){
            this.player = 'red';
            $('#player').html('Красный');
            $('#player').css({color:'red'});
        }else{
            this.player = 'blue';
            $('#player').html('Синий');
            $('#player').css({color:'blue'});
        }
    };

    Game.prototype.actionBorn = function(cell){
        if(this.player == 'blue'){
            cell.setStatus(CellStatus.BLUE);
        }else{
            cell.setStatus(CellStatus.RED);
        }
    };

    Game.prototype.actionAbsorb = function(cell){
        if(this.player == 'blue'){
            cell.setStatus(CellStatus.BLUE_Z);
        }else{
            cell.setStatus(CellStatus.RED_Z);
        }
    };

    Game.prototype.checkAvailability = function(x,y){
        function checkZombie(){
            if(typeof that.cellsChecked[neighbours[k].x] === 'undefined' || that.cellsChecked[neighbours[k].x][neighbours[k].y] !== 1){
                if(typeof that.cellsChecked[neighbours[k].x] === 'undefined') that.cellsChecked[neighbours[k].x] = [];
                that.cellsChecked[neighbours[k].x][neighbours[k].y] = 1;
                available_cnt += that.checkAvailability(neighbours[k].x,neighbours[k].y);
            }
        }
        var neighbours = [
            {x: x, y: y-1},
            {x: x, y: y+1},
            {x: x-1, y: y-1},
            {x: x-1, y: y},
            {x: x-1, y: y+1},
            {x: x+1, y: y-1},
            {x: x+1, y: y},
            {x: x+1, y: y+1}
        ];
        var available_cnt = 0;
        var k = 0;
        var that = this;
        if(this.player == 'blue')
        {
            for(k=0;k<neighbours.length;k++){
                if(
                    typeof cells[neighbours[k].x] !== 'undefined'
                        && typeof cells[neighbours[k].x][neighbours[k].y] !== 'undefined'
                        && cells[neighbours[k].x][neighbours[k].y].status !== CellStatus.BLUE
                        && cells[neighbours[k].x][neighbours[k].y].status !== CellStatus.RED_Z
                    )
                {
                    if(cells[neighbours[k].x][neighbours[k].y].status === CellStatus.BLUE_Z){
                        checkZombie();
                    }else{
                        cells[neighbours[k].x][neighbours[k].y].setAvailable();
                        available_cnt++;
                    }
                }
            }
        }else
        {
            for(k=0;k<neighbours.length;k++){
                if(
                    typeof cells[neighbours[k].x] !== 'undefined'
                        && typeof cells[neighbours[k].x][neighbours[k].y] !== 'undefined'
                        && cells[neighbours[k].x][neighbours[k].y].status !== CellStatus.RED
                        && cells[neighbours[k].x][neighbours[k].y].status !== CellStatus.BLUE_Z
                    )
                {
                    if(cells[neighbours[k].x][neighbours[k].y].status === CellStatus.RED_Z){
                        checkZombie();
                    }else{
                        cells[neighbours[k].x][neighbours[k].y].setAvailable();
                        available_cnt++;
                    }
                }
            }
        }
        return available_cnt;
    };

    Game.prototype.calcAvailability = function(){
        for(var x = 0;x < cells.length; x++){
            for(var y = 0;y < cells[x].length; y++){
                cells[x][y].setNotAvailable();
            }
        }
        if(this.turn == 1 && this.step == 1)
        {
            for(y=0;y<cells.length;y++){
                if(this.player == 'blue'){
                    cells[0][y].setAvailable();
                }else{
                    cells[cells[y].length-1][y].setAvailable();
                }
            }
        }else
        {
            var available_cnt = 0;
            for(x = 0;x < cells.length; x++){
                for(y = 0;y < cells[x].length; y++){
                    if(this.player == 'blue'){
                        if(cells[x][y].status == CellStatus.BLUE){
                            if(this.checkAvailability(x,y)){
                                available_cnt++;
                            }
                        }
                    }else if(this.player == 'red'){
                        if(cells[x][y].status == CellStatus.RED){
                            if(this.checkAvailability(x,y)){
                                available_cnt++;
                            }
                        }
                    }
                }
            }
            if(available_cnt == 0) this.gameover();
        }
    };

    Game.prototype.gameover = function(){
        alert('Игрок ' + this.player + ' проиграл!');
        window.location.reload();
    };

    Game.prototype.action = function(x,y){
        if(cells[x][y].available){
            if(cells[x][y].status == CellStatus.EMPTY)
            {
                this.actionBorn(cells[x][y]);
            }else
            {
                this.actionAbsorb(cells[x][y]);
            }
            this.nextStep();
        }
    };

    function fillField(dimension){
        var $field = $('#field ul.cell');
        for(var i=0; i<dimension; i++)
        {
            for(var j=0; j<dimension;j++){
                var el = $('<li data-x="' + j + '" data-y="' + i + '"></li>');
                $field.append(el);
                var cell = new Cell();
                cell.element = el;
                if(typeof cells[j] === 'undefined') cells[j] = [];
                cells[j][i] = cell;
            }
        }
    }

    var game = new Game();
    game.init();

    $('#field ul.cell > li').click(function(){
        var x = $(this).data('x');
        var y = $(this).data('y');
        game.action(x,y);
    });
});