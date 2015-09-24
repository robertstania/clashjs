var _ = require('lodash');
var utils = require('../lib/utils');

// module.exports = {
//   randomMove,
//   getDirection,
//   isVisible,
//   canKill,
//   safeRandomMove,
//   fastGetDirection,
//   turn,
//   getDistance
// };

var gridSize, topLeft, topRight, bottomLeft, bottomRight, lastIndex, corners;
var init = function(gameEnvironment) {
    gridSize = gameEnvironment.gridSize;
    lastIndex = gridSize - 1;
    topLeft = [0, 0];
    topRight = [0, lastIndex];
    bottomLeft = [lastIndex, 0];
    bottomRight = [lastIndex, lastIndex];
    corners = [topLeft, topRight, bottomLeft, bottomRight];
};

var eql = function(pos1, pos2) {
    return pos1[0] == pos2[0] && pos1[1] == pos2[1];
}

module.exports = function() {
    var goToClosestAmmo = function(playerState, enemiesStates, gameEnvironment) {
        var closestAmmo = _.sortBy(gameEnvironment.ammoPosition, function(ammoPosition) {
            return utils.getDistance(playerState.position, ammoPosition);
        })[0];

        var direction = utils.getDirection(playerState.position, closestAmmo);
        if (playerState.direction != direction) {
            return direction;
        }

        return 'move';
    };

    var getNextPosition = function(playerState) {
        switch (playerState.direction) {
            case 'north':
                return [playerState[0], playerState[1] + 1];
            case 'west':
                return [playerState[0] - 1, playerState[1]];
            case 'south':
                return [playerState[0], playerState[1] - 1];
            case 'east':
                return [playerState[0] + 1, playerState[1]];
        }
    };

    var getWillBeKilled = function(playerState, enemiesStates) {
        var nextPosition = getNextPosition(playerState);

        return _.some(enemiesStates, function(enemyState) {
            return utils.canKill(enemyState, [{
                direction: playerState.direction,
                position: nextPosition
            }]);
        });
    };

    var getClosestCorner = function(playerState, gameEnvironment) {
        var gridSize = gameEnvironment.gridSize;
        var corners = [
            [0, 0],
            [0, gridSize - 1],
            [gridSize - 1, gridSize - 1],
            [gridSize - 1, 0]
        ];

        var minDis = null;
        var closestCorner = null;

        for (var i in corners) {
            var corner = corners[i];
            var distance = utils.getDistance(playerState.position, corner);
            if (distance < minDis || minDis == null) {
                minDis = distance;
                closestCorner = corner;
            }
        }

        var direction = utils.getDirection(playerState.position, closestCorner);
        if (playerState.direction == direction) {
            return 'move';
        }

        return direction;
    };

    var atCorner = function(playerState, gameEnvironment) {
        var gridSize = gameEnvironment.gridSize;
        var corners = [
            [0, 0],
            [0, gridSize - 1],
            [gridSize - 1, gridSize - 1],
            [gridSize - 1, 0]
        ];

        return _.some(corners, function(corner) {
            return playerState.position[0] == corner[0] && playerState.position[1] == corner[1];
        });
    };

    var comeAtMeBro = function(playerState, gameEnvironment) {
        if (eql(playerState.position, topLeft)) {
            return playerState.direction == 'south' ? 'east' : 'south';
        } else if (eql(playerState.position, topRight)) {
            return playerState.direction == 'south' ? 'west' : 'south';
        } else if (eql(playerState.position, bottomLeft)) {
            return playerState.direction == 'north' ? 'east' : 'north';
        } else if (eql(playerState.position, bottomRight)) {
            return playerState.direction == 'north' ? 'west' : 'north';
        }

        throw "not at corner";
    };

    return {
        info: {
            name: 'will3',
            style: 1 // one of the 6 styles (0 to 5)
        },

        ai: function(playerState, enemiesStates, gameEnvironment) {
            init(gameEnvironment);

            if (utils.canKill(playerState, enemiesStates)) {
                return 'shoot';
            }

            var canMove = !getWillBeKilled(playerState, enemiesStates);

            if (!canMove) {
                return utils.randomMove();
                while (true) {
                    var move = utils.randomMove();
                }
            }

            var move = utils.randomMove();
            if (playerState.ammo == 0 && gameEnvironment.ammoPosition.length > 0) {
                return goToClosestAmmo(playerState, enemiesStates, gameEnvironment);
            }

            if (!atCorner(playerState, gameEnvironment)) {
                return getClosestCorner(playerState, gameEnvironment);
            }

            return comeAtMeBro(playerState, gameEnvironment);
        }
    }
}();