export function cloneObject(source) {
    return JSON.parse(JSON.stringify(source));
}

export function selectPin(pin1, pin2, type) {
    if (pin1.type === type) {
        return pin1;
    }

    if (pin2.type === type) {
        return pin2;
    }

    return null;
}

export function selectOutputPin(pin1, pin2) {
    return selectPin(pin1, pin2, 'output');
}

export function selectInputPin(pin1, pin2) {
    return selectPin(pin1, pin2, 'input');
}

export function selectPinFromConnection(connection, type) {
    return selectPin(connection.from.pin, connection.to.pin, type);
}

export function selectOutputPinFromConnection(connection) {
    return selectPin(connection.from.pin, connection.to.pin, 'output');
}

export function selectInputPinFromConnection(connection) {
    return selectPin(connection.from.pin, connection.to.pin, 'input');
}

export function findFirstCompatibleNodePins(nodeA, nodeB, filter = null) {
    const pairs = [];
    const busyPins = [];

    for (let pinA of nodeA.$refs['nodeOutput']) {
        for (let pinB of nodeB.$refs['nodeInput']) {
            if (
                    !busyPins.includes(pinB) &&
                    canCreateConnection(pinA.data, pinB.data)
            ) {

                if (filter && !filter(pinA, pinB)) {
                    continue;
                }

                pairs.push([pinA, pinB]);
                busyPins.push(pinB);

                break;
            }
        }
    }

    return pairs;
}

export function canCreateConnection(initiatorPin, receiverPin) {
    return receiverPin.types.some(receiverType => {
        return initiatorPin.types.some(initiatorType => {
            return isTwoTypesCompatible(initiatorType, receiverType)
        });
    });
}

export function isConnectionValid(connection) {
    return canCreateConnection(connection.from.pin.data, connection.to.pin.data);
}

export function isTypesCompatible(initiatorTypes, receiverTypes) {
    return receiverTypes.some(receiverType => {
        return initiatorTypes.some(initiatorType => {
            return isTwoTypesCompatible(initiatorType, receiverType);
        });
    });
}

export function isTwoTypesCompatible(inType, outType) {
    if(outType.compatibleTypes.includes(inType.type)) {
        return true;
    }

    // check Array case
    const inTypeName  = inType.type;
    const outTypeName = outType.type;

    if (inTypeName.startsWith('Array') && outTypeName.startsWith('Array')) {
        // extract inner type
        const inMatches  = inTypeName.match(/([^<]+)(<(.*?)>){0,1}$/);
        const outMatches = outTypeName.match(/([^<]+)(<(.*?)>){0,1}$/);

        if (outMatches.length === 4 && outMatches[3] === 'any') {
            return true;
        }

        if (inMatches.length !== 4) {
            return false;
        }

        // check inner type compatibility
        const tmp = Object.values(window.vueStore.state.config.typesHashMap).find(item => item.type === outMatches[3]);

        if (!tmp) {
            return false;
        }

        return tmp.compatibleTypes.includes(inMatches[3]);
    }

    return false;
}

export function typeIsArray(type) {
    return type.flags & 1;
}

export function typeIsExecutionPin(type) {
    return type.flags & 2;
}