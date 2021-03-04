
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCAL_WALLET = 'localWallet';
    const monthNames = [
        "jan","feb","mar","apr",
        "may","jun","jul","aug",
        "sep", "oct","nov","dec"
    ];
    const MONTH_MAP = {
        'jan': 'January',
        'feb': 'February',
        'mar': 'March',
        'apr': 'April',
        'may': 'May',
        'jun': 'June',
        'jul': 'July',
        'aug': 'August',
        'sep': 'September',
        'oct': 'October',
        'nov': 'November',
        'dec': 'December'
    };
    function getYearList() {
        const year = new Date().getFullYear();
        const years = [year];
        for (let i = 1;i <= 10;i++) {
            years.push(year + i);
            years.unshift(year - i);
        }
        return years;
    }

    function saveToLocalStorage(wallets) {
        console.log('Stored Data', wallets);
        localStorage.setItem(LOCAL_WALLET, JSON.stringify(wallets));
    }

    function getFromLocalStorage() {
        return JSON.parse(localStorage.getItem(LOCAL_WALLET));
    }

    function restoreTransactionBalance(transaction, walletBalance) {
        return Number(transaction.type === 'debit' ? (+walletBalance + +transaction.amount).toFixed(2) : (+walletBalance - +transaction.amount).toFixed(2));
    }

    function handleTransactionBalance(transaction, walletBalance) {
        return Number(transaction.type === 'debit' ? (+walletBalance - +transaction.amount).toFixed(2) : (+walletBalance + +transaction.amount).toFixed(2));
    }

    function createWallet() {
        const {subscribe, set, update} = writable(getFromLocalStorage() || []);

        return {
            subscribe,
            addWallet: (wallet) => update(wallets => {
                wallets = [...wallets, wallet];
                saveToLocalStorage(wallets);
                return wallets;
            }),
            deleteWallet: (walletId) => update(wallets => {
                const walletIndex = wallets.findIndex(wallet => wallet.id === walletId);
                if (walletIndex > -1) {
                    wallets.splice(walletIndex, 1);
                }
                saveToLocalStorage(wallets);
                return wallets;
            }),
            addTransaction: (transaction, walletId) => update(wallets => {
                wallets = wallets.map(wallet => {
                    if (wallet.id === walletId) {
                        wallet.transactions = [...wallet.transactions, transaction];
                        wallet.balance = handleTransactionBalance(transaction, wallet.balance);
                    }
                    return wallet;
                });
                saveToLocalStorage(wallets);
                return wallets;
            }),
            editTransaction: (transaction, walletId) => update(wallets => {
                wallets = wallets.map(wallet => {
                    if (wallet.id === walletId) {
                        wallet.transactions = [...wallet.transactions.map(trans => {
                            if (trans.id === transaction.id) {
                                wallet.balance = restoreTransactionBalance(trans, wallet.balance);
                                wallet.balance = handleTransactionBalance(transaction, wallet.balance);
                                return transaction;
                            }
                            return trans;
                        })];
                    }
                    return wallet;
                });
                saveToLocalStorage(wallets);
                return wallets;
            }),
            deleteTransaction: (transaction, walletId) => update(wallets => {
                wallets = wallets.map(wallet => {
                    if (wallet.id === walletId) {
                        const findIndex = wallet.transactions.findIndex(t => t.id === transaction.id);
                        if (findIndex > -1) {
                            wallet.balance = restoreTransactionBalance(transaction, wallet.balance);
                            wallet.transactions.splice(findIndex, 1);
                        }
                    }
                    return wallet;
                });
                saveToLocalStorage(wallets);
                return wallets;
            }),
            reset: () => {
                set([]);
                localStorage.removeItem(LOCAL_WALLET);
            }
        }

    }

    const wallet = createWallet();

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.32.3 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/wallets.svelte generated by Svelte v3.32.3 */
    const file = "src/components/wallets.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (23:4) {:else}
    function create_else_block$1(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "No Wallets here.";
    			attr_dev(h3, "class", "placeholder svelte-80umtt");
    			add_location(h3, file, 23, 8, 702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(23:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if $wallet && $wallet.length}
    function create_if_block$1(ctx) {
    	let div;
    	let each_value = /*$wallet*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wallet-wrap svelte-80umtt");
    			add_location(div, file, 11, 4, 320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$wallet*/ 1) {
    				each_value = /*$wallet*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:4) {#if $wallet && $wallet.length}",
    		ctx
    	});

    	return block;
    }

    // (13:8) {#each $wallet as wallet}
    function create_each_block(ctx) {
    	let a;
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h3;
    	let t1_value = /*wallet*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let h2;
    	let t3;
    	let t4_value = /*wallet*/ ctx[1].balance + "";
    	let t4;
    	let t5;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			h2 = element("h2");
    			t3 = text("₹");
    			t4 = text(t4_value);
    			t5 = space();
    			if (img.src !== (img_src_value = "assets/wallet.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "wallet");
    			attr_dev(img, "class", "svelte-80umtt");
    			add_location(img, file, 15, 20, 482);
    			attr_dev(h3, "class", "svelte-80umtt");
    			add_location(h3, file, 16, 20, 545);
    			attr_dev(h2, "class", "svelte-80umtt");
    			add_location(h2, file, 17, 20, 588);
    			attr_dev(div, "class", "wallet svelte-80umtt");
    			add_location(div, file, 14, 16, 441);
    			attr_dev(a, "href", a_href_value = "/" + /*wallet*/ ctx[1].id);
    			attr_dev(a, "class", "svelte-80umtt");
    			add_location(a, file, 13, 12, 392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h3);
    			append_dev(h3, t1);
    			append_dev(div, t2);
    			append_dev(div, h2);
    			append_dev(h2, t3);
    			append_dev(h2, t4);
    			append_dev(a, t5);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$wallet*/ 1 && t1_value !== (t1_value = /*wallet*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$wallet*/ 1 && t4_value !== (t4_value = /*wallet*/ ctx[1].balance + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$wallet*/ 1 && a_href_value !== (a_href_value = "/" + /*wallet*/ ctx[1].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:8) {#each $wallet as wallet}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let div0;
    	let h3;
    	let t1;
    	let h2;
    	let t2;
    	let t3_value = /*$wallet*/ ctx[0].reduce(func, 0) + "";
    	let t3;
    	let t4;
    	let t5;
    	let a;
    	let button;
    	let div1;
    	let t7;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$wallet*/ ctx[0] && /*$wallet*/ ctx[0].length) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Total Balance";
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("₹");
    			t3 = text(t3_value);
    			t4 = space();
    			if_block.c();
    			t5 = space();
    			a = element("a");
    			button = element("button");
    			div1 = element("div");
    			div1.textContent = "Add Wallet";
    			t7 = text("\n            +");
    			attr_dev(h3, "class", "svelte-80umtt");
    			add_location(h3, file, 7, 8, 169);
    			attr_dev(h2, "class", "svelte-80umtt");
    			add_location(h2, file, 8, 8, 200);
    			attr_dev(div0, "class", "total-balance svelte-80umtt");
    			add_location(div0, file, 6, 4, 133);
    			attr_dev(div1, "class", "svelte-80umtt");
    			add_location(div1, file, 27, 12, 838);
    			attr_dev(button, "class", "add-wallet svelte-80umtt");
    			add_location(button, file, 26, 8, 798);
    			attr_dev(a, "href", "/create");
    			attr_dev(a, "class", "svelte-80umtt");
    			add_location(a, file, 25, 4, 762);
    			attr_dev(section, "class", "svelte-80umtt");
    			add_location(section, file, 5, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(section, t4);
    			if_block.m(section, null);
    			append_dev(section, t5);
    			append_dev(section, a);
    			append_dev(a, button);
    			append_dev(button, div1);
    			append_dev(button, t7);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$wallet*/ 1 && t3_value !== (t3_value = /*$wallet*/ ctx[0].reduce(func, 0) + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, t5);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = (sum, wallet) => sum + wallet.balance;

    function instance$1($$self, $$props, $$invalidate) {
    	let $wallet;
    	validate_store(wallet, "wallet");
    	component_subscribe($$self, wallet, $$value => $$invalidate(0, $wallet = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Wallets", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Wallets> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ wallet, link, $wallet });
    	return [$wallet];
    }

    class Wallets extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wallets",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/create-wallet.svelte generated by Svelte v3.32.3 */
    const file$1 = "src/components/create-wallet.svelte";

    // (41:4) {#if errorMsg}
    function create_if_block$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMsg*/ ctx[0]);
    			attr_dev(div, "class", "error-msg svelte-18fu6lr");
    			add_location(div, file$1, 41, 8, 1283);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 1) set_data_dev(t, /*errorMsg*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:4) {#if errorMsg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let form;
    	let div0;
    	let a;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let label0;
    	let h40;
    	let t1;
    	let span0;
    	let t3;
    	let input0;
    	let t4;
    	let div2;
    	let label1;
    	let h41;
    	let t5;
    	let span1;
    	let t7;
    	let input1;
    	let t8;
    	let t9;
    	let button;
    	let img1;
    	let img1_src_value;
    	let mounted;
    	let dispose;
    	let if_block = /*errorMsg*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			label0 = element("label");
    			h40 = element("h4");
    			t1 = text("Name ");
    			span0 = element("span");
    			span0.textContent = "*";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div2 = element("div");
    			label1 = element("label");
    			h41 = element("h4");
    			t5 = text("Initial Balance (₹)");
    			span1 = element("span");
    			span1.textContent = "*";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			if (if_block) if_block.c();
    			t9 = space();
    			button = element("button");
    			img1 = element("img");
    			if (img0.src !== (img0_src_value = "assets/arrow-left.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Back");
    			attr_dev(img0, "class", "svelte-18fu6lr");
    			add_location(img0, file$1, 25, 12, 703);
    			attr_dev(a, "href", "/");
    			add_location(a, file$1, 24, 8, 669);
    			attr_dev(div0, "class", "top-bar svelte-18fu6lr");
    			add_location(div0, file$1, 23, 4, 639);
    			attr_dev(span0, "class", "required-asterik");
    			add_location(span0, file$1, 30, 21, 836);
    			attr_dev(h40, "class", "svelte-18fu6lr");
    			add_location(h40, file$1, 30, 12, 827);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Wallet Name");
    			attr_dev(input0, "class", "svelte-18fu6lr");
    			add_location(input0, file$1, 31, 12, 893);
    			add_location(label0, file$1, 29, 8, 807);
    			attr_dev(div1, "class", "form-row svelte-18fu6lr");
    			add_location(div1, file$1, 28, 4, 776);
    			attr_dev(span1, "class", "required-asterik");
    			add_location(span1, file$1, 36, 35, 1069);
    			attr_dev(h41, "class", "svelte-18fu6lr");
    			add_location(h41, file$1, 36, 12, 1046);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "1");
    			attr_dev(input1, "placeholder", "Wallet Initial Balance");
    			attr_dev(input1, "class", "svelte-18fu6lr");
    			add_location(input1, file$1, 37, 12, 1126);
    			add_location(label1, file$1, 35, 8, 1026);
    			attr_dev(div2, "class", "form-row svelte-18fu6lr");
    			add_location(div2, file$1, 34, 4, 995);
    			if (img1.src !== (img1_src_value = "assets/arrow-right.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Add");
    			attr_dev(img1, "class", "svelte-18fu6lr");
    			add_location(img1, file$1, 44, 8, 1390);
    			attr_dev(button, "class", "svelte-18fu6lr");
    			add_location(button, file$1, 43, 4, 1337);
    			attr_dev(form, "class", "svelte-18fu6lr");
    			add_location(form, file$1, 22, 0, 628);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, a);
    			append_dev(a, img0);
    			append_dev(form, t0);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(label0, h40);
    			append_dev(h40, t1);
    			append_dev(h40, span0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			set_input_value(input0, /*walletName*/ ctx[1]);
    			append_dev(form, t4);
    			append_dev(form, div2);
    			append_dev(div2, label1);
    			append_dev(label1, h41);
    			append_dev(h41, t5);
    			append_dev(h41, span1);
    			append_dev(label1, t7);
    			append_dev(label1, input1);
    			set_input_value(input1, /*walletInitialBalance*/ ctx[2]);
    			append_dev(form, t8);
    			if (if_block) if_block.m(form, null);
    			append_dev(form, t9);
    			append_dev(form, button);
    			append_dev(button, img1);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a)),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "click", prevent_default(/*addWallet*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*walletName*/ 2 && input0.value !== /*walletName*/ ctx[1]) {
    				set_input_value(input0, /*walletName*/ ctx[1]);
    			}

    			if (dirty & /*walletInitialBalance*/ 4 && to_number(input1.value) !== /*walletInitialBalance*/ ctx[2]) {
    				set_input_value(input1, /*walletInitialBalance*/ ctx[2]);
    			}

    			if (/*errorMsg*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(form, t9);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Create_wallet", slots, []);
    	let errorMsg = "";
    	let walletName = "";
    	let walletInitialBalance = 0;

    	function addWallet() {
    		if (!walletName || walletInitialBalance == null) {
    			$$invalidate(0, errorMsg = "Fill all the required details");
    			return;
    		}

    		$$invalidate(0, errorMsg = "");

    		wallet.addWallet({
    			id: "_" + Math.random().toString(36).substr(2, 9),
    			name: walletName.trim(),
    			balance: walletInitialBalance,
    			transactions: []
    		});

    		push("/");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Create_wallet> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		walletName = this.value;
    		$$invalidate(1, walletName);
    	}

    	function input1_input_handler() {
    		walletInitialBalance = to_number(this.value);
    		$$invalidate(2, walletInitialBalance);
    	}

    	$$self.$capture_state = () => ({
    		wallet,
    		push,
    		link,
    		errorMsg,
    		walletName,
    		walletInitialBalance,
    		addWallet
    	});

    	$$self.$inject_state = $$props => {
    		if ("errorMsg" in $$props) $$invalidate(0, errorMsg = $$props.errorMsg);
    		if ("walletName" in $$props) $$invalidate(1, walletName = $$props.walletName);
    		if ("walletInitialBalance" in $$props) $$invalidate(2, walletInitialBalance = $$props.walletInitialBalance);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		errorMsg,
    		walletName,
    		walletInitialBalance,
    		addWallet,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Create_wallet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Create_wallet",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/wallet-details.svelte generated by Svelte v3.32.3 */
    const file$2 = "src/components/wallet-details.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (36:12) {#each monthNames as month}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = MONTH_MAP[/*month*/ ctx[18]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*month*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file$2, 36, 12, 1355);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(36:12) {#each monthNames as month}",
    		ctx
    	});

    	return block;
    }

    // (42:12) {#each yearList as year}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*year*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*year*/ ctx[15];
    			option.value = option.__value;
    			add_location(option, file$2, 42, 12, 1607);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(42:12) {#each yearList as year}",
    		ctx
    	});

    	return block;
    }

    // (61:8) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No Transactions";
    			attr_dev(p, "class", "placeholder svelte-4y8wwc");
    			add_location(p, file$2, 61, 12, 2477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(61:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:8) {#if selectedWallet.transactions && selectedWallet.transactions.length}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let each_value = /*selectedWallet*/ ctx[3].transactions.filter(/*func*/ ctx[10]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedWallet, selectedDuration*/ 12) {
    				each_value = /*selectedWallet*/ ctx[3].transactions.filter(/*func*/ ctx[10]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(49:8) {#if selectedWallet.transactions && selectedWallet.transactions.length}",
    		ctx
    	});

    	return block;
    }

    // (50:12) {#each selectedWallet.transactions.filter(t => t.duration === selectedDuration) as transaction}
    function create_each_block$1(ctx) {
    	let a;
    	let div1;
    	let div0;
    	let h4;
    	let t0_value = /*transaction*/ ctx[12].name + "";
    	let t0;
    	let t1;
    	let h5;
    	let t2_value = /*transaction*/ ctx[12].desc + "";
    	let t2;
    	let t3;
    	let h2;
    	let t4;
    	let t5_value = /*transaction*/ ctx[12].amount + "";
    	let t5;
    	let h2_class_value;
    	let t6;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			h5 = element("h5");
    			t2 = text(t2_value);
    			t3 = space();
    			h2 = element("h2");
    			t4 = text("₹");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(h4, "class", "svelte-4y8wwc");
    			add_location(h4, file$2, 53, 28, 2157);
    			attr_dev(h5, "class", "svelte-4y8wwc");
    			add_location(h5, file$2, 54, 28, 2213);
    			attr_dev(div0, "class", "transaction-info svelte-4y8wwc");
    			add_location(div0, file$2, 52, 24, 2098);

    			attr_dev(h2, "class", h2_class_value = "" + (null_to_empty(/*transaction*/ ctx[12].type === "debit"
    			? "red"
    			: "green") + " svelte-4y8wwc"));

    			add_location(h2, file$2, 56, 24, 2296);
    			attr_dev(div1, "class", "transaction svelte-4y8wwc");
    			add_location(div1, file$2, 51, 20, 2048);
    			attr_dev(a, "href", a_href_value = "/" + /*selectedWallet*/ ctx[3].id + "/" + /*transaction*/ ctx[12].id + "/edit");
    			attr_dev(a, "class", "svelte-4y8wwc");
    			add_location(a, file$2, 50, 16, 1965);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h5);
    			append_dev(h5, t2);
    			append_dev(div1, t3);
    			append_dev(div1, h2);
    			append_dev(h2, t4);
    			append_dev(h2, t5);
    			append_dev(a, t6);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedDuration*/ 4 && t0_value !== (t0_value = /*transaction*/ ctx[12].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*selectedDuration*/ 4 && t2_value !== (t2_value = /*transaction*/ ctx[12].desc + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*selectedDuration*/ 4 && t5_value !== (t5_value = /*transaction*/ ctx[12].amount + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*selectedDuration*/ 4 && h2_class_value !== (h2_class_value = "" + (null_to_empty(/*transaction*/ ctx[12].type === "debit"
    			? "red"
    			: "green") + " svelte-4y8wwc"))) {
    				attr_dev(h2, "class", h2_class_value);
    			}

    			if (dirty & /*selectedDuration*/ 4 && a_href_value !== (a_href_value = "/" + /*selectedWallet*/ ctx[3].id + "/" + /*transaction*/ ctx[12].id + "/edit")) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(50:12) {#each selectedWallet.transactions.filter(t => t.duration === selectedDuration) as transaction}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let button0;
    	let t2;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let h30;
    	let t5;
    	let h2;
    	let t6;
    	let t7_value = /*selectedWallet*/ ctx[3].balance + "";
    	let t7;
    	let t8;
    	let div2;
    	let select0;
    	let t9;
    	let select1;
    	let t10;
    	let div3;
    	let h31;
    	let t12;
    	let t13;
    	let a1;
    	let button1;
    	let div4;
    	let t15;
    	let a1_href_value;
    	let mounted;
    	let dispose;
    	let each_value_2 = monthNames;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*yearList*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*selectedWallet*/ ctx[3].transactions && /*selectedWallet*/ ctx[3].transactions.length) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			button0 = element("button");
    			button0.textContent = "Delete";
    			t2 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t3 = space();
    			h30 = element("h3");
    			h30.textContent = `${/*selectedWallet*/ ctx[3].name}`;
    			t5 = space();
    			h2 = element("h2");
    			t6 = text("₹");
    			t7 = text(t7_value);
    			t8 = space();
    			div2 = element("div");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			h31.textContent = "TRANSACTIONS";
    			t12 = space();
    			if_block.c();
    			t13 = space();
    			a1 = element("a");
    			button1 = element("button");
    			div4 = element("div");
    			div4.textContent = "Add Transaction";
    			t15 = text("\n            +");
    			if (img0.src !== (img0_src_value = "assets/arrow-left.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Back");
    			attr_dev(img0, "class", "svelte-4y8wwc");
    			add_location(img0, file$2, 23, 12, 785);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-4y8wwc");
    			add_location(a0, file$2, 22, 8, 751);
    			attr_dev(button0, "class", "danger-btn");
    			add_location(button0, file$2, 25, 8, 851);
    			attr_dev(div0, "class", "top-bar svelte-4y8wwc");
    			add_location(div0, file$2, 21, 4, 721);
    			if (img1.src !== (img1_src_value = "assets/wallet.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "wallet");
    			attr_dev(img1, "class", "svelte-4y8wwc");
    			add_location(img1, file$2, 28, 8, 969);
    			attr_dev(h30, "class", "svelte-4y8wwc");
    			add_location(h30, file$2, 29, 8, 1020);
    			attr_dev(h2, "class", "" + (null_to_empty(/*selectedWallet*/ ctx[3].balance < 0 ? "red" : "green") + " svelte-4y8wwc"));
    			add_location(h2, file$2, 30, 8, 1059);
    			attr_dev(div1, "class", "wallet-header svelte-4y8wwc");
    			add_location(div1, file$2, 27, 4, 933);
    			if (/*selectedMonth*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[8].call(select0));
    			add_location(select0, file$2, 34, 8, 1243);
    			if (/*selectedYear*/ ctx[0] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[9].call(select1));
    			add_location(select1, file$2, 40, 8, 1499);
    			attr_dev(div2, "class", "date-picker svelte-4y8wwc");
    			add_location(div2, file$2, 32, 4, 1161);
    			attr_dev(h31, "class", "svelte-4y8wwc");
    			add_location(h31, file$2, 47, 8, 1739);
    			attr_dev(div3, "class", "wallet-transactions svelte-4y8wwc");
    			add_location(div3, file$2, 46, 4, 1697);
    			attr_dev(div4, "class", "svelte-4y8wwc");
    			add_location(div4, file$2, 66, 12, 2666);
    			attr_dev(button1, "class", "add-transaction svelte-4y8wwc");
    			add_location(button1, file$2, 65, 8, 2621);
    			attr_dev(a1, "href", a1_href_value = "/" + /*selectedWallet*/ ctx[3].id + "/" + /*selectedDuration*/ ctx[2] + "/add");
    			attr_dev(a1, "class", "svelte-4y8wwc");
    			add_location(a1, file$2, 64, 4, 2549);
    			attr_dev(section, "class", "svelte-4y8wwc");
    			add_location(section, file$2, 20, 0, 707);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(section, t2);
    			append_dev(section, div1);
    			append_dev(div1, img1);
    			append_dev(div1, t3);
    			append_dev(div1, h30);
    			append_dev(div1, t5);
    			append_dev(div1, h2);
    			append_dev(h2, t6);
    			append_dev(h2, t7);
    			append_dev(section, t8);
    			append_dev(section, div2);
    			append_dev(div2, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*selectedMonth*/ ctx[1]);
    			append_dev(div2, t9);
    			append_dev(div2, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*selectedYear*/ ctx[0]);
    			append_dev(section, t10);
    			append_dev(section, div3);
    			append_dev(div3, h31);
    			append_dev(div3, t12);
    			if_block.m(div3, null);
    			append_dev(section, t13);
    			append_dev(section, a1);
    			append_dev(a1, button1);
    			append_dev(button1, div4);
    			append_dev(button1, t15);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a0)),
    					listen_dev(button0, "click", /*deleteWallet*/ ctx[6], false, false, false),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[8]),
    					listen_dev(select0, "change", /*setDuration*/ ctx[5], false, false, false),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[9]),
    					listen_dev(select1, "change", /*setDuration*/ ctx[5], false, false, false),
    					action_destroyer(link.call(null, a1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*monthNames, MONTH_MAP*/ 0) {
    				each_value_2 = monthNames;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*selectedMonth, monthNames*/ 2) {
    				select_option(select0, /*selectedMonth*/ ctx[1]);
    			}

    			if (dirty & /*yearList*/ 16) {
    				each_value_1 = /*yearList*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*selectedYear, yearList*/ 17) {
    				select_option(select1, /*selectedYear*/ ctx[0]);
    			}

    			if_block.p(ctx, dirty);

    			if (dirty & /*selectedDuration*/ 4 && a1_href_value !== (a1_href_value = "/" + /*selectedWallet*/ ctx[3].id + "/" + /*selectedDuration*/ ctx[2] + "/add")) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $wallet;
    	validate_store(wallet, "wallet");
    	component_subscribe($$self, wallet, $$value => $$invalidate(11, $wallet = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Wallet_details", slots, []);
    	let { params = {} } = $$props;
    	let selectedWallet = $wallet.find(wallet => wallet.id === params.id);
    	let selectedYear = new Date().getFullYear();
    	let selectedMonth = monthNames[new Date().getMonth()];
    	const yearList = getYearList();
    	let selectedDuration = `${selectedMonth}-${selectedYear}`;

    	function setDuration() {
    		$$invalidate(2, selectedDuration = `${selectedMonth}-${selectedYear}`);
    	}

    	function deleteWallet() {
    		wallet.deleteWallet(selectedWallet.id);
    		push("/");
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Wallet_details> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selectedMonth = select_value(this);
    		$$invalidate(1, selectedMonth);
    	}

    	function select1_change_handler() {
    		selectedYear = select_value(this);
    		$$invalidate(0, selectedYear);
    		$$invalidate(4, yearList);
    	}

    	const func = t => t.duration === selectedDuration;

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(7, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		wallet,
    		link,
    		push,
    		getYearList,
    		monthNames,
    		MONTH_MAP,
    		params,
    		selectedWallet,
    		selectedYear,
    		selectedMonth,
    		yearList,
    		selectedDuration,
    		setDuration,
    		deleteWallet,
    		$wallet
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(7, params = $$props.params);
    		if ("selectedWallet" in $$props) $$invalidate(3, selectedWallet = $$props.selectedWallet);
    		if ("selectedYear" in $$props) $$invalidate(0, selectedYear = $$props.selectedYear);
    		if ("selectedMonth" in $$props) $$invalidate(1, selectedMonth = $$props.selectedMonth);
    		if ("selectedDuration" in $$props) $$invalidate(2, selectedDuration = $$props.selectedDuration);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedYear,
    		selectedMonth,
    		selectedDuration,
    		selectedWallet,
    		yearList,
    		setDuration,
    		deleteWallet,
    		params,
    		select0_change_handler,
    		select1_change_handler,
    		func
    	];
    }

    class Wallet_details extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { params: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wallet_details",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get params() {
    		throw new Error("<Wallet_details>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Wallet_details>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/create-transaction.svelte generated by Svelte v3.32.3 */
    const file$3 = "src/components/create-transaction.svelte";

    // (62:8) {#if errorMsg}
    function create_if_block$4(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMsg*/ ctx[1]);
    			attr_dev(div, "class", "error-msg svelte-18fu6lr");
    			add_location(div, file$3, 62, 12, 2292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 2) set_data_dev(t, /*errorMsg*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(62:8) {#if errorMsg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let form;
    	let div0;
    	let a;
    	let img0;
    	let img0_src_value;
    	let a_href_value;
    	let t0;
    	let div1;
    	let label0;
    	let h40;
    	let t1;
    	let span0;
    	let t3;
    	let input0;
    	let t4;
    	let div2;
    	let label1;
    	let h41;
    	let t6;
    	let input1;
    	let t7;
    	let div3;
    	let label2;
    	let h42;
    	let t8;
    	let span1;
    	let t10;
    	let input2;
    	let t11;
    	let div4;
    	let label3;
    	let h43;
    	let t12;
    	let span2;
    	let t14;
    	let select;
    	let option0;
    	let option1;
    	let t17;
    	let t18;
    	let button;
    	let img1;
    	let img1_src_value;
    	let mounted;
    	let dispose;
    	let if_block = /*errorMsg*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			label0 = element("label");
    			h40 = element("h4");
    			t1 = text("Name");
    			span0 = element("span");
    			span0.textContent = "*";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div2 = element("div");
    			label1 = element("label");
    			h41 = element("h4");
    			h41.textContent = "Description";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div3 = element("div");
    			label2 = element("label");
    			h42 = element("h4");
    			t8 = text("Transaction Amount (₹)");
    			span1 = element("span");
    			span1.textContent = "*";
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			div4 = element("div");
    			label3 = element("label");
    			h43 = element("h4");
    			t12 = text("Transaction Type");
    			span2 = element("span");
    			span2.textContent = "*";
    			t14 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Debit (-)";
    			option1 = element("option");
    			option1.textContent = "Credit (+)";
    			t17 = space();
    			if (if_block) if_block.c();
    			t18 = space();
    			button = element("button");
    			img1 = element("img");
    			if (img0.src !== (img0_src_value = "assets/arrow-left.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Back");
    			attr_dev(img0, "class", "svelte-18fu6lr");
    			add_location(img0, file$3, 31, 16, 1007);
    			attr_dev(a, "href", a_href_value = "/" + /*params*/ ctx[0].id);
    			add_location(a, file$3, 30, 12, 958);
    			attr_dev(div0, "class", "top-bar svelte-18fu6lr");
    			add_location(div0, file$3, 29, 8, 924);
    			attr_dev(span0, "class", "required-asterik");
    			add_location(span0, file$3, 36, 24, 1159);
    			attr_dev(h40, "class", "svelte-18fu6lr");
    			add_location(h40, file$3, 36, 16, 1151);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Transaction Name");
    			input0.required = "true";
    			attr_dev(input0, "class", "svelte-18fu6lr");
    			add_location(input0, file$3, 37, 16, 1220);
    			add_location(label0, file$3, 35, 12, 1127);
    			attr_dev(div1, "class", "form-row svelte-18fu6lr");
    			add_location(div1, file$3, 34, 8, 1092);
    			attr_dev(h41, "class", "svelte-18fu6lr");
    			add_location(h41, file$3, 42, 16, 1419);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Transaction Description");
    			attr_dev(input1, "class", "svelte-18fu6lr");
    			add_location(input1, file$3, 43, 16, 1456);
    			add_location(label1, file$3, 41, 12, 1395);
    			attr_dev(div2, "class", "form-row svelte-18fu6lr");
    			add_location(div2, file$3, 40, 8, 1360);
    			attr_dev(span1, "class", "required-asterik");
    			add_location(span1, file$3, 48, 42, 1672);
    			attr_dev(h42, "class", "svelte-18fu6lr");
    			add_location(h42, file$3, 48, 16, 1646);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "1");
    			attr_dev(input2, "placeholder", "Wallet Initial Balance");
    			input2.required = "true";
    			attr_dev(input2, "class", "svelte-18fu6lr");
    			add_location(input2, file$3, 49, 16, 1733);
    			add_location(label2, file$3, 47, 12, 1622);
    			attr_dev(div3, "class", "form-row svelte-18fu6lr");
    			add_location(div3, file$3, 46, 8, 1587);
    			attr_dev(span2, "class", "required-asterik");
    			add_location(span2, file$3, 54, 36, 1972);
    			attr_dev(h43, "class", "svelte-18fu6lr");
    			add_location(h43, file$3, 54, 16, 1952);
    			option0.__value = "debit";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 56, 20, 2091);
    			option1.__value = "credit";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 57, 20, 2152);
    			if (/*transactionType*/ ctx[5] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$3, 55, 16, 2033);
    			add_location(label3, file$3, 53, 12, 1928);
    			attr_dev(div4, "class", "form-row svelte-18fu6lr");
    			add_location(div4, file$3, 52, 8, 1893);
    			if (img1.src !== (img1_src_value = "assets/arrow-right.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Add");
    			attr_dev(img1, "class", "svelte-18fu6lr");
    			add_location(img1, file$3, 65, 12, 2416);
    			attr_dev(button, "class", "svelte-18fu6lr");
    			add_location(button, file$3, 64, 8, 2354);
    			attr_dev(form, "class", "svelte-18fu6lr");
    			add_location(form, file$3, 28, 4, 909);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, a);
    			append_dev(a, img0);
    			append_dev(form, t0);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(label0, h40);
    			append_dev(h40, t1);
    			append_dev(h40, span0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			set_input_value(input0, /*transactionName*/ ctx[2]);
    			append_dev(form, t4);
    			append_dev(form, div2);
    			append_dev(div2, label1);
    			append_dev(label1, h41);
    			append_dev(label1, t6);
    			append_dev(label1, input1);
    			set_input_value(input1, /*transactionDesc*/ ctx[3]);
    			append_dev(form, t7);
    			append_dev(form, div3);
    			append_dev(div3, label2);
    			append_dev(label2, h42);
    			append_dev(h42, t8);
    			append_dev(h42, span1);
    			append_dev(label2, t10);
    			append_dev(label2, input2);
    			set_input_value(input2, /*transactionBalance*/ ctx[4]);
    			append_dev(form, t11);
    			append_dev(form, div4);
    			append_dev(div4, label3);
    			append_dev(label3, h43);
    			append_dev(h43, t12);
    			append_dev(h43, span2);
    			append_dev(label3, t14);
    			append_dev(label3, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*transactionType*/ ctx[5]);
    			append_dev(form, t17);
    			if (if_block) if_block.m(form, null);
    			append_dev(form, t18);
    			append_dev(form, button);
    			append_dev(button, img1);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a)),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[10]),
    					listen_dev(button, "click", prevent_default(/*addTransaction*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*params*/ 1 && a_href_value !== (a_href_value = "/" + /*params*/ ctx[0].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*transactionName*/ 4 && input0.value !== /*transactionName*/ ctx[2]) {
    				set_input_value(input0, /*transactionName*/ ctx[2]);
    			}

    			if (dirty & /*transactionDesc*/ 8 && input1.value !== /*transactionDesc*/ ctx[3]) {
    				set_input_value(input1, /*transactionDesc*/ ctx[3]);
    			}

    			if (dirty & /*transactionBalance*/ 16 && to_number(input2.value) !== /*transactionBalance*/ ctx[4]) {
    				set_input_value(input2, /*transactionBalance*/ ctx[4]);
    			}

    			if (dirty & /*transactionType*/ 32) {
    				select_option(select, /*transactionType*/ ctx[5]);
    			}

    			if (/*errorMsg*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(form, t18);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Create_transaction", slots, []);
    	let { params = {} } = $$props;
    	let errorMsg = "";
    	let transactionName = "";
    	let transactionDesc = "";
    	let transactionBalance = 0;
    	let transactionType = "debit";

    	function addTransaction() {
    		if (!transactionName || transactionBalance == null) {
    			$$invalidate(1, errorMsg = "Fill all the required details");
    			return;
    		}

    		$$invalidate(1, errorMsg = "");

    		wallet.addTransaction(
    			{
    				id: "_" + Math.random().toString(36).substr(2, 9),
    				name: transactionName.trim(),
    				desc: transactionDesc && transactionDesc.trim() || "",
    				amount: transactionBalance,
    				type: transactionType,
    				duration: params.duration.toLowerCase()
    			},
    			params.id
    		);

    		push(`/${params.id}`);
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Create_transaction> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		transactionName = this.value;
    		$$invalidate(2, transactionName);
    	}

    	function input1_input_handler() {
    		transactionDesc = this.value;
    		$$invalidate(3, transactionDesc);
    	}

    	function input2_input_handler() {
    		transactionBalance = to_number(this.value);
    		$$invalidate(4, transactionBalance);
    	}

    	function select_change_handler() {
    		transactionType = select_value(this);
    		$$invalidate(5, transactionType);
    	}

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		wallet,
    		push,
    		link,
    		params,
    		errorMsg,
    		transactionName,
    		transactionDesc,
    		transactionBalance,
    		transactionType,
    		addTransaction
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("errorMsg" in $$props) $$invalidate(1, errorMsg = $$props.errorMsg);
    		if ("transactionName" in $$props) $$invalidate(2, transactionName = $$props.transactionName);
    		if ("transactionDesc" in $$props) $$invalidate(3, transactionDesc = $$props.transactionDesc);
    		if ("transactionBalance" in $$props) $$invalidate(4, transactionBalance = $$props.transactionBalance);
    		if ("transactionType" in $$props) $$invalidate(5, transactionType = $$props.transactionType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		errorMsg,
    		transactionName,
    		transactionDesc,
    		transactionBalance,
    		transactionType,
    		addTransaction,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		select_change_handler
    	];
    }

    class Create_transaction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Create_transaction",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get params() {
    		throw new Error("<Create_transaction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Create_transaction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/edit-transaction.svelte generated by Svelte v3.32.3 */
    const file$4 = "src/components/edit-transaction.svelte";

    // (84:4) {#if errorMsg}
    function create_if_block$5(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMsg*/ ctx[1]);
    			attr_dev(div, "class", "error-msg svelte-1yvtano");
    			add_location(div, file$4, 84, 8, 3083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMsg*/ 2) set_data_dev(t, /*errorMsg*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(84:4) {#if errorMsg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let form;
    	let div0;
    	let a;
    	let img0;
    	let img0_src_value;
    	let a_href_value;
    	let t0;
    	let button0;
    	let t2;
    	let div1;
    	let label0;
    	let h40;
    	let t3;
    	let span0;
    	let t5;
    	let input0;
    	let t6;
    	let div2;
    	let label1;
    	let h41;
    	let t7;
    	let span1;
    	let t9;
    	let input1;
    	let t10;
    	let div3;
    	let label2;
    	let h42;
    	let t11;
    	let span2;
    	let t13;
    	let input2;
    	let t14;
    	let div4;
    	let label3;
    	let h43;
    	let t15;
    	let span3;
    	let t17;
    	let select;
    	let option0;
    	let option1;
    	let t20;
    	let t21;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let mounted;
    	let dispose;
    	let if_block = /*errorMsg*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t0 = space();
    			button0 = element("button");
    			button0.textContent = "Delete";
    			t2 = space();
    			div1 = element("div");
    			label0 = element("label");
    			h40 = element("h4");
    			t3 = text("Name");
    			span0 = element("span");
    			span0.textContent = "*";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div2 = element("div");
    			label1 = element("label");
    			h41 = element("h4");
    			t7 = text("Description");
    			span1 = element("span");
    			span1.textContent = "*";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div3 = element("div");
    			label2 = element("label");
    			h42 = element("h4");
    			t11 = text("Transaction Amount (₹)");
    			span2 = element("span");
    			span2.textContent = "*";
    			t13 = space();
    			input2 = element("input");
    			t14 = space();
    			div4 = element("div");
    			label3 = element("label");
    			h43 = element("h4");
    			t15 = text("Transaction Type");
    			span3 = element("span");
    			span3.textContent = "*";
    			t17 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Debit (-)";
    			option1 = element("option");
    			option1.textContent = "Credit (+)";
    			t20 = space();
    			if (if_block) if_block.c();
    			t21 = space();
    			button1 = element("button");
    			img1 = element("img");
    			if (img0.src !== (img0_src_value = "assets/arrow-left.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Back");
    			attr_dev(img0, "class", "svelte-1yvtano");
    			add_location(img0, file$4, 52, 12, 1803);
    			attr_dev(a, "href", a_href_value = "/" + /*params*/ ctx[0].id);
    			add_location(a, file$4, 51, 8, 1758);
    			attr_dev(button0, "class", "danger-btn");
    			add_location(button0, file$4, 54, 8, 1869);
    			attr_dev(div0, "class", "top-bar svelte-1yvtano");
    			add_location(div0, file$4, 50, 4, 1728);
    			attr_dev(span0, "class", "required-asterik");
    			add_location(span0, file$4, 58, 20, 2015);
    			attr_dev(h40, "class", "svelte-1yvtano");
    			add_location(h40, file$4, 58, 12, 2007);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Transaction Name");
    			input0.required = "true";
    			attr_dev(input0, "class", "svelte-1yvtano");
    			add_location(input0, file$4, 59, 12, 2072);
    			add_location(label0, file$4, 57, 8, 1987);
    			attr_dev(div1, "class", "form-row svelte-1yvtano");
    			add_location(div1, file$4, 56, 4, 1956);
    			attr_dev(span1, "class", "required-asterik");
    			add_location(span1, file$4, 64, 27, 2266);
    			attr_dev(h41, "class", "svelte-1yvtano");
    			add_location(h41, file$4, 64, 12, 2251);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Transaction Description");
    			attr_dev(input1, "class", "svelte-1yvtano");
    			add_location(input1, file$4, 65, 12, 2323);
    			add_location(label1, file$4, 63, 8, 2231);
    			attr_dev(div2, "class", "form-row svelte-1yvtano");
    			add_location(div2, file$4, 62, 4, 2200);
    			attr_dev(span2, "class", "required-asterik");
    			add_location(span2, file$4, 70, 38, 2519);
    			attr_dev(h42, "class", "svelte-1yvtano");
    			add_location(h42, file$4, 70, 12, 2493);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "1");
    			attr_dev(input2, "placeholder", "Wallet Initial Balance");
    			input2.required = "true";
    			attr_dev(input2, "class", "svelte-1yvtano");
    			add_location(input2, file$4, 71, 12, 2576);
    			add_location(label2, file$4, 69, 8, 2473);
    			attr_dev(div3, "class", "form-row svelte-1yvtano");
    			add_location(div3, file$4, 68, 4, 2442);
    			attr_dev(span3, "class", "required-asterik");
    			add_location(span3, file$4, 76, 32, 2795);
    			attr_dev(h43, "class", "svelte-1yvtano");
    			add_location(h43, file$4, 76, 12, 2775);
    			option0.__value = "debit";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 78, 16, 2906);
    			option1.__value = "credit";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 79, 16, 2963);
    			if (/*transactionType*/ ctx[5] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[11].call(select));
    			add_location(select, file$4, 77, 12, 2852);
    			add_location(label3, file$4, 75, 8, 2755);
    			attr_dev(div4, "class", "form-row svelte-1yvtano");
    			add_location(div4, file$4, 74, 4, 2724);
    			if (img1.src !== (img1_src_value = "assets/arrow-right.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Add");
    			attr_dev(img1, "class", "svelte-1yvtano");
    			add_location(img1, file$4, 87, 8, 3215);
    			attr_dev(button1, "class", "submit-btn svelte-1yvtano");
    			add_location(button1, file$4, 86, 4, 3137);
    			attr_dev(form, "class", "svelte-1yvtano");
    			add_location(form, file$4, 49, 0, 1717);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, a);
    			append_dev(a, img0);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(label0, h40);
    			append_dev(h40, t3);
    			append_dev(h40, span0);
    			append_dev(label0, t5);
    			append_dev(label0, input0);
    			set_input_value(input0, /*transactionName*/ ctx[2]);
    			append_dev(form, t6);
    			append_dev(form, div2);
    			append_dev(div2, label1);
    			append_dev(label1, h41);
    			append_dev(h41, t7);
    			append_dev(h41, span1);
    			append_dev(label1, t9);
    			append_dev(label1, input1);
    			set_input_value(input1, /*transactionDesc*/ ctx[3]);
    			append_dev(form, t10);
    			append_dev(form, div3);
    			append_dev(div3, label2);
    			append_dev(label2, h42);
    			append_dev(h42, t11);
    			append_dev(h42, span2);
    			append_dev(label2, t13);
    			append_dev(label2, input2);
    			set_input_value(input2, /*transactionBalance*/ ctx[4]);
    			append_dev(form, t14);
    			append_dev(form, div4);
    			append_dev(div4, label3);
    			append_dev(label3, h43);
    			append_dev(h43, t15);
    			append_dev(h43, span3);
    			append_dev(label3, t17);
    			append_dev(label3, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*transactionType*/ ctx[5]);
    			append_dev(form, t20);
    			if (if_block) if_block.m(form, null);
    			append_dev(form, t21);
    			append_dev(form, button1);
    			append_dev(button1, img1);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link.call(null, a)),
    					listen_dev(button0, "click", /*deleteTransaction*/ ctx[7], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[11]),
    					listen_dev(button1, "click", prevent_default(/*editTransaction*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*params*/ 1 && a_href_value !== (a_href_value = "/" + /*params*/ ctx[0].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*transactionName*/ 4 && input0.value !== /*transactionName*/ ctx[2]) {
    				set_input_value(input0, /*transactionName*/ ctx[2]);
    			}

    			if (dirty & /*transactionDesc*/ 8 && input1.value !== /*transactionDesc*/ ctx[3]) {
    				set_input_value(input1, /*transactionDesc*/ ctx[3]);
    			}

    			if (dirty & /*transactionBalance*/ 16 && to_number(input2.value) !== /*transactionBalance*/ ctx[4]) {
    				set_input_value(input2, /*transactionBalance*/ ctx[4]);
    			}

    			if (dirty & /*transactionType*/ 32) {
    				select_option(select, /*transactionType*/ ctx[5]);
    			}

    			if (/*errorMsg*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(form, t21);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $wallet;
    	validate_store(wallet, "wallet");
    	component_subscribe($$self, wallet, $$value => $$invalidate(13, $wallet = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Edit_transaction", slots, []);
    	let { params = {} } = $$props;
    	let errorMsg = "";
    	let transactionName = "";
    	let transactionDesc = "";
    	let transactionBalance = 0;
    	let transactionType = "debit";
    	let selectedTransaction;

    	onMount(async () => {
    		const selectedWallet = $wallet.find(wallet => wallet.id === params.id);
    		selectedTransaction = selectedWallet.transactions.find(t => t.id === params.tId);
    		$$invalidate(2, transactionName = selectedTransaction.name);
    		$$invalidate(3, transactionDesc = selectedTransaction.desc);
    		$$invalidate(4, transactionBalance = selectedTransaction.amount);
    		$$invalidate(5, transactionType = selectedTransaction.type);
    	});

    	function editTransaction() {
    		if (!transactionName || transactionBalance == null) {
    			$$invalidate(1, errorMsg = "Fill all the required details");
    			return;
    		}

    		$$invalidate(1, errorMsg = "");

    		wallet.editTransaction(
    			{
    				id: params.tId,
    				name: transactionName.trim(),
    				desc: transactionDesc.trim(),
    				amount: transactionBalance,
    				type: transactionType,
    				duration: selectedTransaction.duration
    			},
    			params.id
    		);

    		push(`/${params.id}`);
    	}

    	function deleteTransaction() {
    		wallet.deleteTransaction(
    			{
    				id: params.tId,
    				name: transactionName.trim(),
    				desc: transactionDesc && transactionDesc.trim() || "",
    				amount: transactionBalance,
    				type: transactionType,
    				duration: selectedTransaction.duration
    			},
    			params.id
    		);

    		push(`/${params.id}`);
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Edit_transaction> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		transactionName = this.value;
    		$$invalidate(2, transactionName);
    	}

    	function input1_input_handler() {
    		transactionDesc = this.value;
    		$$invalidate(3, transactionDesc);
    	}

    	function input2_input_handler() {
    		transactionBalance = to_number(this.value);
    		$$invalidate(4, transactionBalance);
    	}

    	function select_change_handler() {
    		transactionType = select_value(this);
    		$$invalidate(5, transactionType);
    	}

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		wallet,
    		push,
    		link,
    		params,
    		errorMsg,
    		transactionName,
    		transactionDesc,
    		transactionBalance,
    		transactionType,
    		selectedTransaction,
    		editTransaction,
    		deleteTransaction,
    		$wallet
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("errorMsg" in $$props) $$invalidate(1, errorMsg = $$props.errorMsg);
    		if ("transactionName" in $$props) $$invalidate(2, transactionName = $$props.transactionName);
    		if ("transactionDesc" in $$props) $$invalidate(3, transactionDesc = $$props.transactionDesc);
    		if ("transactionBalance" in $$props) $$invalidate(4, transactionBalance = $$props.transactionBalance);
    		if ("transactionType" in $$props) $$invalidate(5, transactionType = $$props.transactionType);
    		if ("selectedTransaction" in $$props) selectedTransaction = $$props.selectedTransaction;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		params,
    		errorMsg,
    		transactionName,
    		transactionDesc,
    		transactionBalance,
    		transactionType,
    		editTransaction,
    		deleteTransaction,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		select_change_handler
    	];
    }

    class Edit_transaction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Edit_transaction",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get params() {
    		throw new Error("<Edit_transaction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Edit_transaction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const routes = {
        '/': Wallets,
        '/create': Create_wallet,
        '/:id': Wallet_details,
        '/:id/:duration/add': Create_transaction,
        '/:id/:tId/edit': Edit_transaction,
        '*': Wallets
    };

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$5 = "src/App.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let div0;
    	let button;
    	let t8;
    	let router;
    	let t9;
    	let div1;
    	let h4;
    	let t10;
    	let a0;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let a1;
    	let img2;
    	let img2_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			img0 = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Mini Bank";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Store all your transactions";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "(All of the data are stored in your browser.)";
    			t6 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Delete All";
    			t8 = space();
    			create_component(router.$$.fragment);
    			t9 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			t10 = text("Made with ❤️ using \n\t\t\t");
    			a0 = element("a");
    			img1 = element("img");
    			t11 = text("\n\t\t\tand \n\t\t\t");
    			a1 = element("a");
    			img2 = element("img");
    			if (img0.src !== (img0_src_value = "assets/bank.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "MiniBank");
    			attr_dev(img0, "class", "svelte-1wkc3mt");
    			add_location(img0, file$5, 12, 1, 221);
    			attr_dev(h1, "class", "svelte-1wkc3mt");
    			add_location(h1, file$5, 13, 1, 265);
    			attr_dev(p0, "class", "svelte-1wkc3mt");
    			add_location(p0, file$5, 14, 1, 285);
    			attr_dev(p1, "class", "svelte-1wkc3mt");
    			add_location(p1, file$5, 15, 1, 321);
    			attr_dev(button, "class", "danger-btn");
    			add_location(button, file$5, 17, 8, 405);
    			attr_dev(div0, "class", "top-bar svelte-1wkc3mt");
    			add_location(div0, file$5, 16, 1, 375);
    			if (img1.src !== (img1_src_value = "assets/svelte.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Svelte");
    			attr_dev(img1, "class", "svelte-1wkc3mt");
    			add_location(img1, file$5, 23, 4, 595);
    			attr_dev(a0, "href", "https://svelte.dev/");
    			add_location(a0, file$5, 22, 3, 560);
    			if (img2.src !== (img2_src_value = "assets/github.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Github");
    			attr_dev(img2, "class", "svelte-1wkc3mt");
    			add_location(img2, file$5, 27, 4, 713);
    			attr_dev(a1, "href", "https://github.com/vishugosain/mini-bank");
    			add_location(a1, file$5, 26, 3, 657);
    			attr_dev(h4, "class", "svelte-1wkc3mt");
    			add_location(h4, file$5, 21, 2, 533);
    			attr_dev(div1, "class", "about-wrap svelte-1wkc3mt");
    			add_location(div1, file$5, 20, 1, 506);
    			attr_dev(main, "class", "svelte-1wkc3mt");
    			add_location(main, file$5, 11, 0, 213);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img0);
    			append_dev(main, t0);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			append_dev(main, p0);
    			append_dev(main, t4);
    			append_dev(main, p1);
    			append_dev(main, t6);
    			append_dev(main, div0);
    			append_dev(div0, button);
    			append_dev(main, t8);
    			mount_component(router, main, null);
    			append_dev(main, t9);
    			append_dev(main, div1);
    			append_dev(div1, h4);
    			append_dev(h4, t10);
    			append_dev(h4, a0);
    			append_dev(a0, img1);
    			append_dev(h4, t11);
    			append_dev(h4, a1);
    			append_dev(a1, img2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*deleteAll*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	function deleteAll() {
    		wallet.reset();
    		push("/");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ wallet, Router, push, routes, deleteAll });
    	return [deleteAll];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    Date.prototype.toDurationFormat = function() {
        
        let monthIndex = this.getMonth();
        let monthName = monthNames[monthIndex];

        let year = this.getFullYear();
        
        return `${monthName}-${year}`;  
    };

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
