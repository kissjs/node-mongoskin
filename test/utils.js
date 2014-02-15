/*!
 * mongoskin - test/utils.js
 *
 * Copyright(c) 2011 - 2012 kissjs.org
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var utils = require('../').utils;
var should = require('should');

describe('makeSkinClass', function () {

    function Foo() {
      this.isOpen = false;
    }

    Foo.prototype.chain = function() {
      return this;
    }

    Foo.prototype.get = function(arg, callback) {
      if(!this.isOpen) return callback(new Error('not open'));
      callback(null, arg);
    }

    Foo.prototype.makeError = function(code, callback) {
      var err = new Error('Error:' + code);
      err.code = code;
      callback(err);
    }

    var SkinFoo = utils.makeSkinClass(Foo);
    SkinFoo._bindSetter('isOpen');
    SkinFoo._bindGetter('isOpen');
    SkinFoo.prototype._open = function(callback) {
      var foo = new Foo();
      var self = this;
      setTimeout(function() {
          if(self.willOpenError) {
            var err = new Error();
            err.code = 'ERROPEN';
            return callback(err)
          } else {
            foo.isOpen = true;
            callback(null, foo);
          }
      }, 10);
    }

    var skinFoo;
    before(function() {

        skinFoo = new SkinFoo();

    })

    describe('SkinClass', function() {
        it('should call native method', function(done) {
            skinFoo.get('echo', function(err, echo) {
                should.not.exists(err);
                echo.should.eql('echo');
                done();
            });
        });

        it('should callback error if error occused', function(done) {
            skinFoo.makeError('123', function(err) {
                err.code.should.eql('123');
                done();
            })
        })

        it('should chain operations', function(done) {
            skinFoo.chain().chain().chain().get('echo', done);
        })

        it('should log open error if no callback', function(done) {
            var errFoo = new SkinFoo();
            errFoo.willOpenError = true;
            errFoo.chain();
            setTimeout(done, 15);
        });

        it('should callback open error in chain callback', function(done) {
            var errFoo = new SkinFoo();
            errFoo.willOpenError = true;
            errFoo.chain().chain().chain().get(function(err) {
                err.code.should.eql('ERROPEN');
                done();
            });
        })

        it('should get native property after open', function(done) {
            skinFoo.isOpen.should.be.true;
            done();
        })

        it('should set native property before open', function(done) {
            var foo = new SkinFoo();
            foo.isOpen = 'abc';
            foo.open(function(err, p_foo) {
                should.not.exists(err);
                p_foo.isOpen.should.eql('abc');
                done();
            })
        })

        it('should close just while openning', function(done) {
            var foo = new SkinFoo();
            foo.chain().close(done);
        })

        it('should call close even closing or closed', function(done) {
            var foo = new SkinFoo();
            foo.chain().close().close(done);
        })
    })


});
