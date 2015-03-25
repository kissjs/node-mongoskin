var mongo = require('../');
var ObjectID = mongo.ObjectID;
var helper = mongo.helper;

describe('helper.id()', function () {
    it('should convert string id to ObjectID success', function () {
        var id = '4ec4b2b9f44a927223000001';
        id = helper.toObjectID(id);
        id.should.be.instanceof(ObjectID);
        id = helper.toObjectID(id);
        id.should.be.instanceof(ObjectID);
        id = '4ec4b2b9f44a927223000foo';
        id = helper.toObjectID(id);
        id.should.be.instanceof(ObjectID);
    });
    it('should return source id when id length !== 24', function () {
        var ids = [123, '4ec4b2b9f44a92722300000', 'abc', '4ec4b2b9f44a927223000f00123123'];
        ids.forEach(function (id) {
            helper.toObjectID(id).should.equal(id);
        });
    });
});

describe('helper.isObjectID()', function () {
    it('should return false when ID is not valid hex', function () {
        var id = '54da050b878fd5d462672bea';
        var isID = helper.isObjectID(id);
        isID.should.equal(true);
        id = 'h4da050b878fd5d462672bea';
        isID = helper.isObjectID(id);
        isID.should.equal(false);
    });
});
