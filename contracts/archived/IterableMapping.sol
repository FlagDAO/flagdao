// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library IterableMapping {
    // Iterable mapping from address to uint;
    struct Map {
        address[] keys;
        mapping(address => uint) values;
        mapping(address => uint) indexOf;
        mapping(address => bool) inserted; // 判断地址是否已在 Map 中.
    }
    
    function get(Map storage map, address key) public view returns (uint) {
        return map.values[key];  // 获取 address 的 value
    }

    function getKeyAtIndex(Map storage map, uint index) public view returns (address) {
        return map.keys[index];  // 按索引取 address
    }

    function size(Map storage map) public view returns (uint) {
        return map.keys.length;  // 返回 mapping 中的 key 数量
    }

    // 将地址与整数值关联，如果地址已存在于映射中，则更新对应的整数值；
    // 如果地址不存在，则将其插入到映射中
    function set(Map storage map, address key, uint val) public {
        if (map.inserted[key]) {
            map.values[key] = val;
        } else {
            map.inserted[key] = true;
            map.values[key] = val;
            map.indexOf[key] = map.keys.length;
            map.keys.push(key);
        }
    }

    function remove(Map storage map, address key) public {
        if (!map.inserted[key]) {
            return;
        }

        delete map.inserted[key];
        delete map.values[key];

        uint index = map.indexOf[key];
        address lastKey = map.keys[map.keys.length - 1];

        map.indexOf[lastKey] = index;
        delete map.indexOf[key];

        map.keys[index] = lastKey;
        map.keys.pop();
    }
}