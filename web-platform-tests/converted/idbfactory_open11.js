require("../../build/global");
const Event = require("../../build/lib/FakeEvent").default;
const {
    add_completion_callback,
    assert_array_equals,
    assert_equals,
    assert_false,
    assert_not_equals,
    assert_throws,
    assert_true,
    async_test,
    createdb,
    createdb_for_multiple_tests,
    fail,
    format_value,
    indexeddb_test,
    setup,
    test,
} = require("../support-node");

const document = {};
const window = global;


    var db;
    var count_done = 0;
    var open_rq = createdb(async_test(document.title, {timeout: 10000}));

    open_rq.onupgradeneeded = function(e) {
        db = e.target.result;

        db.createObjectStore("store");
        assert_true(db.objectStoreNames.contains("store"), "objectStoreNames contains store");

        var store = e.target.transaction.objectStore("store");
        assert_equals(store.name, "store", "store.name");

        store.add("data", 1);

        store.count().onsuccess = this.step_func(function(e) {
            assert_equals(e.target.result, 1, "count()");
            count_done++;
        });

        store.add("data2", 2);
    };
    open_rq.onsuccess = function(e) {
        var store = db.transaction("store").objectStore("store");
        assert_equals(store.name, "store", "store.name");
        store.count().onsuccess = this.step_func(function(e) {
            assert_equals(e.target.result, 2, "count()");
            count_done++;
        });
        db.close();

        var open_rq2 = window.indexedDB.open(db.name, 10);
        open_rq2.onupgradeneeded = this.step_func(function(e) {
            var db2 = e.target.result;
            assert_true(db2.objectStoreNames.contains("store"), "objectStoreNames contains store");
            var store = open_rq2.transaction.objectStore("store");
            assert_equals(store.name, "store", "store.name");

            store.add("data3", 3);

            store.count().onsuccess = this.step_func(function(e) {
                assert_equals(e.target.result, 3, "count()");
                count_done++;

                assert_equals(count_done, 3, "count_done");
                this.done();
            });
        });
    };