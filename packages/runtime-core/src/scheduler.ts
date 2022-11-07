const queue: any[] = [];
const activePreFlushCbs: any = [];

const p = Promise.resolve();
let isFlushPending = false;

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
}

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs);
}

export function nextTick(fn?) {
  return fn ? p.then(fn) : p;
}

function flushJobs() {
  isFlushPending = false;
  // 执行前置队列
  flushPreFlushCbs();

  try {
    let job;
    while ((job = queue.shift())) {
      if (job) {
        job();
      }
    }
  } finally {
    // 执行过程中产生了新的队列，那么继续执行回调
    if(queue.length) {
      flushJobs()
    }
  }
}

function flushPreFlushCbs() {
  for (let i = 0; i < activePreFlushCbs.length; i++) {
    activePreFlushCbs[i]();
  }
}

export function queuePreFlushCb(cb) {
  queueCb(cb, activePreFlushCbs);
}

function queueCb(cb, activeQueue) {
  activeQueue.push(cb);
  queueFlush();
}
