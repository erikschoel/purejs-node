'use strict';

var utils = require('../utils');

var dispatcher = utils.arrApply((function MakeDispatcher() {

  return [].slice.call(arguments);
})(
  (function $$DISPATCHER($wrap, $clean, $schedule, $main, $info, $run, $proc, $shift, $enqueue, $next, $sto) {

    var sys  = utils.obj();
    var proc = utils.obj();
    var info = $info.call(proc);
    proc.$set('clean',    $clean);
    proc.$set('schedule', $schedule);
    proc.$set('run',      $run);
    proc.$set('shift',    $shift);
    proc.$set('proc',     $proc);

    var shared = { tick: false, rafNext: 0, isWorker: sys.isWorker };
    var tick   = proc.$set('nextTick', $clean('nxt', shared));

    tick.raf   = !sys.isWorker;
    tick.fn    = $proc;
    tick.run   = $run(tick, $wrap);

    if (sys.isWorker) {
      tick.schedule = $schedule(proc.$get('native.nxt'), Function.prototype.bind.call($main, tick));
    }else {
      tick.schedule = shared.nextTick = proc.$get('native.nxt')(Function.prototype.bind.call($main, tick));

      var raf      = proc.$set('animFrame', $clean('raf', shared));
      raf.fn       = $shift;
      raf.run      = $run(raf, $wrap);
      raf.schedule = $schedule(proc.$get('native.raf'), Function.prototype.bind.call($main, raf));
      raf.enqueue  = proc.raf = $enqueue(raf.store,  raf.schedule);
    }
    tick.enqueue = proc.enqueue = $enqueue(tick.store, tick.schedule);
    tick.next    = $next;
    tick.timeout = $sto(tick.enqueue);

    return proc;
  }),

  // wrapper //
  (function() {
    try {
      return this.fn();
    }catch(e) {
      console.log(e);
      this.store.splice(this.index, 1);
      this.index = 0;
      if (this.store.length) this.schedule();
      return true;
    }
  }),

  // getCleanInfo //
  (function(code, shared) {
    return {
      currts: 0, prevts: 0, donets: 0, lastts: 0, done: 0,
      count: 0, size: 0, length: 0, frameid: 0, index: 0,
      code: code, isRaf: code == 'raf',
      store: [], shared: shared, maxlen: 0, now: self.nowInfo.obj
    };
  }),

  // createSchedule //
  (function(timer, fn) {
    return function() {
      return timer(fn);
    }
  }),

  // createMain //
  (function() {
    this.currts = this.now.now();//self.now();
    this.prevts = this.length ? this.lastts : this.currts;
    this.donets+= this.currts - this.prevts;
    if (this.isRaf) {
      if (this.store.length && (this.shared.rafNext = (this.currts + 16.667))) {
        this.rafid = this.schedule();
        if (this.run()) {
          cancelAnimationFrame(this.rafid);
          this.shared.rafNext = 0;
        }
      }else this.shared.rafNext = 0;
      if (this.shared.tick && !(this.shared.tick = 0)) this.shared.nextTick();
    }else if (this.shared.rafNext && (this.limit = this.shared.rafNext - 2)) {
      if ((this.limit - this.currts) > 3) {
        if (!this.run()) {
          if ((this.shared.rafNext - this.lastts) > 6) this.schedule();
          else this.shared.tick = this.shared.rafNext;
        }
      }else this.shared.tick = this.shared.rafNext;
    }else if ((this.limit = this.currts + 8) && !this.run()) {
      if (!this.shared.rafNext || ((this.shared.rafNext - this.lastts) > 6)) this.schedule();
      else this.shared.tick = this.shared.rafNext;
    }
    this.suspend = false;
  }),

  // createInfo //
  (function() {
    return this.$set('stats', (function() {
      var time = 0, lim = 0, len = 0, idx = 0, handle = 0;
      var info = {},
        count   = info.count   = 0,
        size    = info.size    = 0,
        length  = info.length  = 0,
        maxlen  = info.maxlen  = 0,
        frameid = info.frameid = 10000,
        runid   = info.runid   = frameid,
        ts      = info.ts      = 0,
        prev    = info.prev    = 0,
        toggle  = 0,
        buffer  = info.buffer = 0,
        handle  = info.handle = 1,
        next    = [],
        id      = 0;
      var refs = [ frameid, time, lim, len, idx ];
      return info;
    })(
      this.native = {
        sto: self.setTimeout,
        cto: self.clearTimeout,
        raf: self.requestAnimationFrame,
        caf: self.cancelAnimationFrame,
        siv: self.setInterval,
        civ: self.clearInterval,
        nxt: (function(msgchan, sim) {
          return self.isWorker ? sim() : msgchan;
        })(
          (function(process_messages) {
            var message_channel = new MessageChannel();
            var message_state   = { queued: false, running: false };
            function queue_dispatcher()  {
              if (!(message_state.queued && message_state.running)) {
                message_state.queued = true;
                message_channel.port2.postMessage(0);
              }
            };
            message_channel.port1.onmessage = function(_) {
              if (!(message_state.queued = false)
                && (message_state.running = true) && !process_messages())
                  message_state.running = false;//queue_dispatcher();
              else message_state.queued = message_state.running = false;
            };
            return queue_dispatcher;
          }),
          (function() {
            return self.setImmediate;
          })
        )
      }
    ));
  }),

  // createRun //
  (function(info, fn) {
    return Function.prototype.bind.call(fn, info);
  }),

  // coreProc //
  (function() {
    this.maxlen = (this.size = this.length = this.store.length) > this.maxlen ? this.size : this.maxlen;
    this.done   = this.count;
    this.frameid++;

    while(++this.count && this.store.length) {
      if ((this.item = this.store[this.index]) && ++this.item.count && (this.item.frameid || (this.item.frameid = this.frameid)) && this.item.next(this)) {
        if (this.index == 0) {
          this.store.shift();
        }else if (this.store.length - this.index == 1) {
          this.store.pop(); this.index = 0;
        }else {
          this.store.splice(this.index, 1);
        }
        this.index < this.size || (this.index = 0);
      }else if (this.item.frameid < this.frameid) {
        ++this.item.frameid;
      }else if (this.store.length > 1) {
        ++this.index < this.store.length || (this.index = 0);
      }else {
        this.index = 0;
      }
      if (this.suspend || ((this.lastts = this.now.now()) > this.limit)) break;
    };
    this.done = this.count - this.done;
    return (!(this.length = this.store.length));
  }),

  // coreShift //
  (function() {
    this.index   = 0;
    this.maxlen  = ((this.size = this.length = this.store.length) > this.maxlen ? this.size : this.maxlen);
    this.frameid++;
    // console.log('RAF: ' + (this.currts - this.lastts) + 'ms');
    while(!this.suspend && ++this.count && this.store.length) {
      if (this.store[this.index].next(this)) {
        this.store.splice(this.index, 1);
        this.index < this.store.length || (this.index = 0);
      }else {
        ++this.index < this.store.length || (this.index = 0);
      }
    };
    return (this.lastts = this.now.now()) && (!(this.length = this.store.length));
  }),

  // enqueue //
  (function(store, run) {
    return function enqueue(item) {
      if (item && (!(store.length * store.push(item.next ? item : { count: 0, frameid: 0, next: item })))) run();
    };
  }),

  // next //
  (function(combine) {
    return function $_next(body) {
      return combine(body);
    };
  })(
    (function $combine($body) {
      return function $_pure($cont) {
        return function() {
           $body($cont);
           return true;
        };
      }
    })
  ),

  // sto //
  (function(enqueue) {
    return function(fn, ms) {
      return self.setTimeout(function() {
        enqueue(function() {
          fn();
          return true;
        });
      }, ms);
    }
  })
));

module.exports = dispatcher;

// Allow use of default import syntax in TypeScript
module.exports.default = dispatcher;
