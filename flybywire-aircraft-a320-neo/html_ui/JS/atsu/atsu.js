(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Atsu = {}));
})(this, (function (exports) { 'use strict';

    //  Copyright (c) 2022 FlyByWire Simulations
    //  SPDX-License-Identifier: GPL-3.0
    exports.AtsuStatusCodes = void 0;

    (function (AtsuStatusCodes) {
      AtsuStatusCodes[AtsuStatusCodes["Ok"] = 0] = "Ok";
      AtsuStatusCodes[AtsuStatusCodes["CallsignInUse"] = 1] = "CallsignInUse";
      AtsuStatusCodes[AtsuStatusCodes["OwnCallsign"] = 2] = "OwnCallsign";
      AtsuStatusCodes[AtsuStatusCodes["NoHoppieConnection"] = 3] = "NoHoppieConnection";
      AtsuStatusCodes[AtsuStatusCodes["NoTelexConnection"] = 4] = "NoTelexConnection";
      AtsuStatusCodes[AtsuStatusCodes["TelexDisabled"] = 5] = "TelexDisabled";
      AtsuStatusCodes[AtsuStatusCodes["ComFailed"] = 6] = "ComFailed";
      AtsuStatusCodes[AtsuStatusCodes["NoAtc"] = 7] = "NoAtc";
      AtsuStatusCodes[AtsuStatusCodes["DcduFull"] = 8] = "DcduFull";
      AtsuStatusCodes[AtsuStatusCodes["UnknownMessage"] = 9] = "UnknownMessage";
      AtsuStatusCodes[AtsuStatusCodes["ProxyError"] = 10] = "ProxyError";
      AtsuStatusCodes[AtsuStatusCodes["SystemBusy"] = 11] = "SystemBusy";
    })(exports.AtsuStatusCodes || (exports.AtsuStatusCodes = {}));

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    /**
     * Allows interacting with the persistent storage
     */
    class NXDataStore {
      static get listener() {
        if (this.mListener === undefined) {
          this.mListener = RegisterViewListener('JS_LISTENER_SIMVARS');
        }

        return this.mListener;
      }
      /**
       * Reads a value from persistent storage
       * @param key The property key
       * @param defaultVal The default value if the property is not set
       */


      static get(key, defaultVal) {
        const val = GetStoredData("A32NX_".concat(key)); // GetStoredData returns null on error, or empty string for keys that don't exist (why isn't that an error??)
        // We could use SearchStoredData, but that spams the console with every key (somebody left their debug print in)

        if (val === null || val.length === 0) {
          return defaultVal;
        }

        return val;
      }
      /**
       * Sets a value in persistent storage
       *
       * @param key The property key
       * @param val The value to assign to the property
       */


      static set(key, val) {
        SetStoredData("A32NX_".concat(key), val);
        this.listener.triggerToAllSubscribers('A32NX_NXDATASTORE_UPDATE', key, val);
      }

      static subscribe(key, callback) {
        return Coherent.on('A32NX_NXDATASTORE_UPDATE', (updatedKey, value) => {
          if (key === '*' || key === updatedKey) {
            callback(updatedKey, value);
          }
        }).clear;
      }

      static getAndSubscribe(key, callback, defaultVal) {
        callback(key, NXDataStore.get(key, defaultVal));
        return NXDataStore.subscribe(key, callback);
      }

    }

    _defineProperty(NXDataStore, "mListener", void 0);

    //  Copyright (c) 2022 FlyByWire Simulations
    //  SPDX-License-Identifier: GPL-3.0

    /**
     * Defines the decoded UTC timestamp
     */
    class AtsuTimestamp {
      constructor() {
        _defineProperty(this, "Year", SimVar.GetSimVarValue('E:ZULU YEAR', 'number'));

        _defineProperty(this, "Month", SimVar.GetSimVarValue('E:ZULU MONTH OF YEAR', 'number'));

        _defineProperty(this, "Day", SimVar.GetSimVarValue('E:ZULU DAY OF MONTH', 'number'));

        _defineProperty(this, "Seconds", SimVar.GetSimVarValue('E:ZULU TIME', 'seconds'));
      }

      deserialize(jsonData) {
        this.Year = jsonData.Year;
        this.Month = jsonData.Month;
        this.Day = jsonData.Day;
        this.Seconds = jsonData.Seconds;
      }

      dcduTimestamp() {
        const hours = Math.floor(this.Seconds / 3600);
        const minutes = Math.floor(this.Seconds / 60) % 60;
        return "".concat(hours.toString().padStart(2, '0')).concat(minutes.toString().padStart(2, '0'), "Z");
      }

      mcduTimestamp() {
        const hours = Math.floor(this.Seconds / 3600);
        const minutes = Math.floor(this.Seconds / 60) % 60;
        return "".concat(hours.toString().padStart(2, '0'), ":").concat(minutes.toString().padStart(2, '0'));
      }

    }

    exports.AtsuMessageNetwork = void 0;

    (function (AtsuMessageNetwork) {
      AtsuMessageNetwork[AtsuMessageNetwork["Hoppie"] = 0] = "Hoppie";
      AtsuMessageNetwork[AtsuMessageNetwork["FBW"] = 1] = "FBW";
    })(exports.AtsuMessageNetwork || (exports.AtsuMessageNetwork = {}));

    exports.AtsuMessageDirection = void 0;

    (function (AtsuMessageDirection) {
      AtsuMessageDirection[AtsuMessageDirection["Input"] = 0] = "Input";
      AtsuMessageDirection[AtsuMessageDirection["Output"] = 1] = "Output";
    })(exports.AtsuMessageDirection || (exports.AtsuMessageDirection = {}));

    exports.AtsuMessageType = void 0;

    (function (AtsuMessageType) {
      AtsuMessageType[AtsuMessageType["Freetext"] = 0] = "Freetext";
      AtsuMessageType[AtsuMessageType["PDC"] = 1] = "PDC";
      AtsuMessageType[AtsuMessageType["METAR"] = 2] = "METAR";
      AtsuMessageType[AtsuMessageType["TAF"] = 3] = "TAF";
      AtsuMessageType[AtsuMessageType["ATIS"] = 4] = "ATIS";
      AtsuMessageType[AtsuMessageType["AOC"] = 5] = "AOC";
      AtsuMessageType[AtsuMessageType["CPDLC"] = 6] = "CPDLC";
      AtsuMessageType[AtsuMessageType["ATC"] = 7] = "ATC";
    })(exports.AtsuMessageType || (exports.AtsuMessageType = {}));

    exports.AtsuMessageComStatus = void 0;

    (function (AtsuMessageComStatus) {
      AtsuMessageComStatus[AtsuMessageComStatus["Open"] = 0] = "Open";
      AtsuMessageComStatus[AtsuMessageComStatus["Sending"] = 1] = "Sending";
      AtsuMessageComStatus[AtsuMessageComStatus["Sent"] = 2] = "Sent";
      AtsuMessageComStatus[AtsuMessageComStatus["Received"] = 3] = "Received";
      AtsuMessageComStatus[AtsuMessageComStatus["Failed"] = 4] = "Failed";
    })(exports.AtsuMessageComStatus || (exports.AtsuMessageComStatus = {}));

    exports.AtsuMessageSerializationFormat = void 0;
    /**
     * Defines the generic ATC message
     */

    (function (AtsuMessageSerializationFormat) {
      AtsuMessageSerializationFormat[AtsuMessageSerializationFormat["MCDU"] = 0] = "MCDU";
      AtsuMessageSerializationFormat[AtsuMessageSerializationFormat["DCDU"] = 1] = "DCDU";
      AtsuMessageSerializationFormat[AtsuMessageSerializationFormat["Printer"] = 2] = "Printer";
      AtsuMessageSerializationFormat[AtsuMessageSerializationFormat["Network"] = 3] = "Network";
    })(exports.AtsuMessageSerializationFormat || (exports.AtsuMessageSerializationFormat = {}));

    class AtsuMessage {
      constructor() {
        _defineProperty(this, "Network", exports.AtsuMessageNetwork.Hoppie);

        _defineProperty(this, "UniqueMessageID", -1);

        _defineProperty(this, "Timestamp", undefined);

        _defineProperty(this, "Station", '');

        _defineProperty(this, "ComStatus", exports.AtsuMessageComStatus.Open);

        _defineProperty(this, "Type", undefined);

        _defineProperty(this, "Direction", undefined);

        _defineProperty(this, "Confirmed", false);

        _defineProperty(this, "Message", '');
      }

      serialize(_format) {
        throw new Error('No valid implementation');
      } // used to deserialize event data


      deserialize(jsonData) {
        this.Network = jsonData.Network;
        this.UniqueMessageID = jsonData.UniqueMessageID;

        if (jsonData.Timestamp !== undefined) {
          this.Timestamp = new AtsuTimestamp();
          this.Timestamp.deserialize(jsonData.Timestamp);
        }

        this.Station = jsonData.Station;
        this.ComStatus = jsonData.ComStatus;
        this.Type = jsonData.Type;
        this.Direction = jsonData.Direction;
        this.Confirmed = jsonData.Confirmed;
        this.Message = jsonData.Message;
      }

    }

    let CpdlcMessageRequestedResponseType;

    (function (CpdlcMessageRequestedResponseType) {
      CpdlcMessageRequestedResponseType[CpdlcMessageRequestedResponseType["NotRequired"] = 0] = "NotRequired";
      CpdlcMessageRequestedResponseType[CpdlcMessageRequestedResponseType["WilcoUnable"] = 1] = "WilcoUnable";
      CpdlcMessageRequestedResponseType[CpdlcMessageRequestedResponseType["AffirmNegative"] = 2] = "AffirmNegative";
      CpdlcMessageRequestedResponseType[CpdlcMessageRequestedResponseType["Roger"] = 3] = "Roger";
      CpdlcMessageRequestedResponseType[CpdlcMessageRequestedResponseType["No"] = 4] = "No";
      CpdlcMessageRequestedResponseType[CpdlcMessageRequestedResponseType["Yes"] = 5] = "Yes";
    })(CpdlcMessageRequestedResponseType || (CpdlcMessageRequestedResponseType = {}));

    exports.CpdlcMessageResponse = void 0;
    /**
     * Defines the general freetext message format
     */

    (function (CpdlcMessageResponse) {
      CpdlcMessageResponse[CpdlcMessageResponse["None"] = 0] = "None";
      CpdlcMessageResponse[CpdlcMessageResponse["Other"] = 1] = "Other";
      CpdlcMessageResponse[CpdlcMessageResponse["Standby"] = 2] = "Standby";
      CpdlcMessageResponse[CpdlcMessageResponse["Wilco"] = 3] = "Wilco";
      CpdlcMessageResponse[CpdlcMessageResponse["Roger"] = 4] = "Roger";
      CpdlcMessageResponse[CpdlcMessageResponse["Affirm"] = 5] = "Affirm";
      CpdlcMessageResponse[CpdlcMessageResponse["Negative"] = 6] = "Negative";
      CpdlcMessageResponse[CpdlcMessageResponse["Unable"] = 7] = "Unable";
      CpdlcMessageResponse[CpdlcMessageResponse["Acknowledge"] = 8] = "Acknowledge";
      CpdlcMessageResponse[CpdlcMessageResponse["Refuse"] = 9] = "Refuse";
    })(exports.CpdlcMessageResponse || (exports.CpdlcMessageResponse = {}));

    class CpdlcMessage extends AtsuMessage {
      // describes the response type of the Response entry
      constructor() {
        super();

        _defineProperty(this, "RequestedResponses", undefined);

        _defineProperty(this, "ResponseType", undefined);

        _defineProperty(this, "Response", undefined);

        _defineProperty(this, "CurrentTransmissionId", -1);

        _defineProperty(this, "PreviousTransmissionId", -1);

        this.Type = exports.AtsuMessageType.CPDLC;
        this.Network = exports.AtsuMessageNetwork.Hoppie;
        this.Direction = exports.AtsuMessageDirection.Output;
      }

      deserialize(jsonData) {
        super.deserialize(jsonData);
        this.RequestedResponses = jsonData.RequestedResponses;
        this.ResponseType = jsonData.ResponseType;

        if (jsonData.Response !== undefined) {
          this.Response = new CpdlcMessage();
          this.Response.deserialize(jsonData.Response);
        }

        this.CurrentTransmissionId = jsonData.CurrentTransmissionId;
        this.PreviousTransmissionId = jsonData.PreviousTransmissionId;
      }

      serialize(format) {
        let message = '';

        if (format === exports.AtsuMessageSerializationFormat.Network) {
          message = "/data2/".concat(this.CurrentTransmissionId, "/").concat(this.PreviousTransmissionId !== -1 ? this.PreviousTransmissionId : '', "/").concat(cpdlcToString(this.RequestedResponses));
          message += "/".concat(this.Message);
        } else if (format === exports.AtsuMessageSerializationFormat.DCDU) {
          // create the lines and interpret '_' as an encoded newline
          let lines = [];
          this.Message.split('_').forEach(entry => {
            lines = lines.concat(wordWrap(entry, 30));
          });
          message = lines.join('\n');
        } else if (format === exports.AtsuMessageSerializationFormat.MCDU) {
          if (this.Direction === exports.AtsuMessageDirection.Input) {
            message += "{cyan}".concat(this.Timestamp.dcduTimestamp(), " FROM ").concat(this.Station, "{end}\n");
          } else {
            message += "{cyan}".concat(this.Timestamp.dcduTimestamp(), " TO ").concat(this.Station, "{end}\n");
          }

          this.Message.split('_').forEach(entry => {
            const newLines = wordWrap(entry, 25);
            newLines.forEach(line => {
              line = line.replace(/@/gi, '');
              message += "{green}".concat(line, "{end}\n");
            });
          });
          message += '{white}------------------------{end}\n';

          if (this.ResponseType === exports.CpdlcMessageResponse.Other && this.Response !== undefined) {
            message += this.Response.serialize(format);
          }
        } else if (format === exports.AtsuMessageSerializationFormat.Printer) {
          message += "".concat(this.Timestamp.dcduTimestamp(), " ").concat(this.Direction === exports.AtsuMessageDirection.Input ? 'FROM' : 'TO', " ").concat(this.Station, "}\n");
          this.Message.split('_').forEach(entry => {
            const newLines = wordWrap(entry, 25);
            newLines.forEach(line => {
              line = line.replace(/@/gi, '');
              message += "".concat(line, "\n");
            });
          });
          message += '------------------------\n';

          if (this.ResponseType === exports.CpdlcMessageResponse.Other && this.Response !== undefined) {
            message += this.Response.serialize(format);
          }
        } else {
          message = this.Message;
        }

        return message;
      }

    }

    function wordWrap(text, maxLength) {
      const result = [];
      let line = [];
      let length = 0;
      text.split(' ').forEach(word => {
        if (length + word.length >= maxLength) {
          result.push(line.join(' ').toUpperCase());
          line = [];
          length = 0;
        }

        length += word.length + 1;
        line.push(word);
      });

      if (line.length > 0) {
        result.push(line.join(' ').toUpperCase());
      }

      return result;
    }
    function cpdlcToString(type) {
      switch (type) {
        case CpdlcMessageRequestedResponseType.AffirmNegative:
          return 'AN';

        case CpdlcMessageRequestedResponseType.No:
          return 'N';

        case CpdlcMessageRequestedResponseType.Roger:
          return 'R';

        case CpdlcMessageRequestedResponseType.WilcoUnable:
          return 'WU';

        case CpdlcMessageRequestedResponseType.Yes:
          return 'Y';

        case CpdlcMessageRequestedResponseType.NotRequired:
          return 'NE';

        default:
          return '';
      }
    }
    function stringToCpdlc(str) {
      switch (str) {
        case 'AN':
          return CpdlcMessageRequestedResponseType.AffirmNegative;

        case 'N':
          return CpdlcMessageRequestedResponseType.No;

        case 'R':
          return CpdlcMessageRequestedResponseType.Roger;

        case 'WU':
          return CpdlcMessageRequestedResponseType.WilcoUnable;

        case 'Y':
          return CpdlcMessageRequestedResponseType.Yes;

        default:
          return CpdlcMessageRequestedResponseType.NotRequired;
      }
    }

    /**
     * Defines the general weather message format
     */

    class WeatherMessage extends AtsuMessage {
      constructor() {
        super();

        _defineProperty(this, "Reports", []);

        this.Direction = exports.AtsuMessageDirection.Input;
      }

      serialize(format) {
        let type = '';

        switch (this.Type) {
          case exports.AtsuMessageType.METAR:
            type = 'METAR';
            break;

          case exports.AtsuMessageType.TAF:
            type = 'TAF';
            break;

          default:
            type = 'ATIS';
            break;
        }

        let message = '';

        if (format === exports.AtsuMessageSerializationFormat.MCDU) {
          this.Reports.forEach(report => {
            message += "{cyan}".concat(type, " ").concat(report.airport, "{end}\n"); // eslint-disable-next-line no-loop-func

            wordWrap(report.report, 25).forEach(line => {
              if (line.startsWith('D-ATIS')) {
                message += "{amber}".concat(line, "{end}\n");
              } else if (line === 'NO METAR AVAILABLE' || line === 'NO TAF AVAILABLE') {
                message += "{amber}".concat(line, "{end}\n");
              } else {
                message += "{green}".concat(line, "{end}\n");
              }
            });
            message += '{white}------------------------{end}\n';
          });
        } else {
          this.Reports.forEach(report => {
            message += "".concat(type, " ").concat(report.airport, "\n"); // eslint-disable-next-line no-loop-func

            message += "".concat(report.report, "\n");
            message += '------------------------\n';
          });
        }

        return message;
      }

    }

    //  Copyright (c) 2021 FlyByWire Simulations
    exports.AtisType = void 0;
    /**
     * Defines the general ATIS message format
     */

    (function (AtisType) {
      AtisType[AtisType["Departure"] = 0] = "Departure";
      AtisType[AtisType["Arrival"] = 1] = "Arrival";
      AtisType[AtisType["Enroute"] = 2] = "Enroute";
    })(exports.AtisType || (exports.AtisType = {}));

    class AtisMessage extends WeatherMessage {
      constructor() {
        super();
        this.Type = exports.AtsuMessageType.ATIS;
        this.Station = NXDataStore.get('CONFIG_ATIS_SRC', 'MSFS');
      }

    }

    //  Copyright (c) 2021 FlyByWire Simulations
    /**
     * Defines the general METAR message format
     */

    class MetarMessage extends WeatherMessage {
      constructor() {
        super();
        this.Type = exports.AtsuMessageType.METAR;
        this.Station = NXDataStore.get('CONFIG_METAR_SRC', 'MSFS');
      }

    }

    //  Copyright (c) 2021 FlyByWire Simulations
    /**
     * Defines the general TAF message format
     */

    class TafMessage extends WeatherMessage {
      constructor() {
        super();
        this.Type = exports.AtsuMessageType.TAF;
        this.Station = NXDataStore.get('CONFIG_TAF_SRC', 'MSFS');
      }

    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var lib = createCommonjsModule(function (module, exports) {

      var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
        var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf || {
            __proto__: []
          } instanceof Array && function (d, b) {
            d.__proto__ = b;
          } || function (d, b) {
            for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
          };

          return extendStatics(d, b);
        };

        return function (d, b) {
          extendStatics(d, b);

          function __() {
            this.constructor = d;
          }

          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      }();

      var __assign = commonjsGlobal && commonjsGlobal.__assign || function () {
        __assign = Object.assign || function (t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];

            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }

          return t;
        };

        return __assign.apply(this, arguments);
      };

      var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function (resolve) {
            resolve(value);
          });
        }

        return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }

          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }

          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }

          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };

      var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
        var _ = {
          label: 0,
          sent: function () {
            if (t[0] & 1) throw t[1];
            return t[1];
          },
          trys: [],
          ops: []
        },
            f,
            y,
            t,
            g;
        return g = {
          next: verb(0),
          "throw": verb(1),
          "return": verb(2)
        }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
          return this;
        }), g;

        function verb(n) {
          return function (v) {
            return step([n, v]);
          };
        }

        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");

          while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];

            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;

              case 4:
                _.label++;
                return {
                  value: op[1],
                  done: false
                };

              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;

              case 7:
                op = _.ops.pop();

                _.trys.pop();

                continue;

              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }

                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }

                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }

                if (t && _.label < t[2]) {
                  _.label = t[2];

                  _.ops.push(op);

                  break;
                }

                if (t[2]) _.ops.pop();

                _.trys.pop();

                continue;
            }

            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }

          if (op[0] & 5) throw op[1];
          return {
            value: op[0] ? op[1] : void 0,
            done: true
          };
        }
      };

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.Charts = exports.GitVersions = exports.ATC = exports.Airport = exports.Telex = exports.Taf = exports.Atis = exports.Metar = exports.NXApi = exports.TelexNotConnectedError = exports.HttpError = exports.AtcType = void 0;

      (function (AtcType) {
        AtcType[AtcType["UNKNOWN"] = 0] = "UNKNOWN";
        AtcType[AtcType["DELIVERY"] = 1] = "DELIVERY";
        AtcType[AtcType["GROUND"] = 2] = "GROUND";
        AtcType[AtcType["TOWER"] = 3] = "TOWER";
        AtcType[AtcType["DEPARTURE"] = 4] = "DEPARTURE";
        AtcType[AtcType["APPROACH"] = 5] = "APPROACH";
        AtcType[AtcType["RADAR"] = 6] = "RADAR";
        AtcType[AtcType["ATIS"] = 7] = "ATIS";
      })(exports.AtcType || (exports.AtcType = {}));

      var HttpError =
      /** @class */
      function (_super) {
        __extends(HttpError, _super);

        function HttpError(status, message) {
          var _this = _super.call(this, message) || this;

          _this.status = status;
          return _this;
        }

        return HttpError;
      }(Error);

      exports.HttpError = HttpError;

      var TelexNotConnectedError =
      /** @class */
      function (_super) {
        __extends(TelexNotConnectedError, _super);

        function TelexNotConnectedError() {
          return _super.call(this, "TELEX is not connected") || this;
        }

        return TelexNotConnectedError;
      }(Error);

      exports.TelexNotConnectedError = TelexNotConnectedError;

      function _get(url, headers) {
        return fetch(url.href, {
          headers: headers
        }).then(function (response) {
          if (!response.ok) {
            throw new HttpError(response.status);
          }

          return response.json();
        });
      }

      function _delete(url, headers) {
        return fetch(url.href, {
          method: "DELETE",
          headers: headers
        }).then(function (response) {
          if (!response.ok) {
            throw new HttpError(response.status);
          }

          return;
        });
      }

      function _post(url, body, headers) {
        var headersToSend = __assign({
          "Content-Type": "application/json"
        }, headers);

        return fetch(url.href, {
          method: "POST",
          body: JSON.stringify(body),
          headers: headersToSend
        }).then(function (response) {
          if (!response.ok) {
            throw new HttpError(response.status);
          }

          return response.json();
        });
      }

      function _put(url, body, headers) {
        var headersToSend = __assign({
          "Content-Type": "application/json"
        }, headers);

        return fetch(url.href, {
          method: "PUT",
          body: JSON.stringify(body),
          headers: headersToSend
        }).then(function (response) {
          if (!response.ok) {
            throw new HttpError(response.status);
          }

          return response.json();
        });
      }

      var NXApi =
      /** @class */
      function () {
        function NXApi() {}

        NXApi.url = new URL("https://api.flybywiresim.com");
        return NXApi;
      }();

      exports.NXApi = NXApi;

      var Metar =
      /** @class */
      function () {
        function Metar() {}

        Metar.get = function (icao, source) {
          if (!icao) {
            throw new Error("No ICAO provided");
          }

          var url = new URL("/metar/" + icao, NXApi.url);

          if (source) {
            url.searchParams.set("source", source);
          }

          return _get(url);
        };

        return Metar;
      }();

      exports.Metar = Metar;

      var Atis =
      /** @class */
      function () {
        function Atis() {}

        Atis.get = function (icao, source) {
          if (!icao) {
            throw new Error("No ICAO provided");
          }

          var url = new URL("/atis/" + icao, NXApi.url);

          if (source) {
            url.searchParams.set("source", source);
          }

          return _get(url);
        };

        return Atis;
      }();

      exports.Atis = Atis;

      var Taf =
      /** @class */
      function () {
        function Taf() {}

        Taf.get = function (icao, source) {
          if (!icao) {
            throw new Error("No ICAO provided");
          }

          var url = new URL("/taf/" + icao, NXApi.url);

          if (source) {
            url.searchParams.set("source", source);
          }

          return _get(url);
        };

        return Taf;
      }();

      exports.Taf = Taf;

      var Telex =
      /** @class */
      function () {
        function Telex() {}

        Telex.connect = function (status) {
          return _post(new URL("/txcxn", NXApi.url), Telex.buildBody(status)).then(function (res) {
            Telex.accessToken = res.accessToken;
            return res;
          });
        };

        Telex.update = function (status) {
          Telex.connectionOrThrow();
          return _put(new URL("/txcxn", NXApi.url), Telex.buildBody(status), {
            Authorization: Telex.buildToken()
          }).then(Telex.mapConnection);
        };

        Telex.disconnect = function () {
          Telex.connectionOrThrow();
          return _delete(new URL("/txcxn", NXApi.url), {
            Authorization: Telex.buildToken()
          }).then(function () {
            Telex.accessToken = "";
            return;
          });
        };

        Telex.sendMessage = function (recipientFlight, message) {
          Telex.connectionOrThrow();
          return _post(new URL("/txmsg", NXApi.url), {
            to: recipientFlight,
            message: message
          }, {
            Authorization: Telex.buildToken()
          }).then(Telex.mapMessage);
        };

        Telex.fetchMessages = function () {
          Telex.connectionOrThrow();
          return _get(new URL("/txmsg", NXApi.url), {
            Authorization: Telex.buildToken()
          }).then(function (res) {
            return res.map(Telex.mapMessage);
          });
        };

        Telex.fetchConnections = function (skip, take, bounds) {
          var url = new URL("/txcxn", NXApi.url);

          if (skip) {
            url.searchParams.set("skip", skip.toString());
          }

          if (take) {
            url.searchParams.append("take", take.toString());
          }

          if (bounds) {
            url.searchParams.append("north", bounds.north.toString());
            url.searchParams.append("east", bounds.east.toString());
            url.searchParams.append("south", bounds.south.toString());
            url.searchParams.append("west", bounds.west.toString());
          }

          return _get(url).then(function (res) {
            return __assign(__assign({}, res), {
              results: res.results.map(Telex.mapConnection)
            });
          });
        };

        Telex.fetchAllConnections = function (bounds, stageCallback) {
          return __awaiter(this, void 0, void 0, function () {
            var flights, skip, total, data;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  flights = [];
                  skip = 0;
                  total = 0;
                  _a.label = 1;

                case 1:
                  return [4
                  /*yield*/
                  , Telex.fetchConnections(skip, 100, bounds)];

                case 2:
                  data = _a.sent();
                  total = data.total;
                  skip += data.count;
                  flights = flights.concat(data.results);

                  if (stageCallback) {
                    stageCallback(flights);
                  }

                  _a.label = 3;

                case 3:
                  if (total > skip) return [3
                  /*break*/
                  , 1];
                  _a.label = 4;

                case 4:
                  return [2
                  /*return*/
                  , flights];
              }
            });
          });
        };

        Telex.fetchConnection = function (id) {
          return _get(new URL("/txcxn/" + id, NXApi.url)).then(Telex.mapConnection);
        };

        Telex.findConnections = function (flightNumber) {
          var url = new URL("/txcxn/_find", NXApi.url);
          url.searchParams.set("flight", flightNumber);
          return _get(url).then(function (res) {
            return {
              matches: res.matches.map(Telex.mapConnection),
              fullMatch: res.fullMatch ? Telex.mapConnection(res.fullMatch) : undefined
            };
          });
        };

        Telex.countConnections = function () {
          return _get(new URL("/txcxn/_count", NXApi.url));
        };

        Telex.buildBody = function (status) {
          return {
            location: {
              x: status.location.long,
              y: status.location.lat
            },
            trueAltitude: status.trueAltitude,
            heading: status.heading,
            origin: status.origin,
            destination: status.destination,
            freetextEnabled: status.freetextEnabled,
            flight: status.flight,
            aircraftType: status.aircraftType
          };
        };

        Telex.buildToken = function () {
          return "Bearer " + Telex.accessToken;
        };

        Telex.connectionOrThrow = function () {
          if (!Telex.accessToken) {
            throw new TelexNotConnectedError();
          }
        };

        Telex.mapConnection = function (connection) {
          return __assign(__assign({}, connection), {
            firstContact: new Date(connection.firstContact),
            lastContact: new Date(connection.lastContact)
          });
        };

        Telex.mapMessage = function (message) {
          var msg = __assign(__assign({}, message), {
            createdAt: new Date(message.createdAt)
          });

          if (message.from) {
            msg.from = Telex.mapConnection(message.from);
          }

          if (message.to) {
            msg.to = Telex.mapConnection(message.to);
          }

          return msg;
        };

        Telex.refreshRate = 15000;
        return Telex;
      }();

      exports.Telex = Telex;

      var Airport =
      /** @class */
      function () {
        function Airport() {}

        Airport.get = function (icao) {
          if (!icao) {
            throw new Error("No ICAO provided");
          }

          return _get(new URL("/api/v1/airport/" + icao, NXApi.url));
        };

        Airport.getBatch = function (icaos) {
          if (!icaos) {
            throw new Error("No ICAOs provided");
          }

          return _post(new URL("/api/v1/airport/_batch", NXApi.url), {
            icaos: icaos
          });
        };

        return Airport;
      }();

      exports.Airport = Airport;

      var ATC =
      /** @class */
      function () {
        function ATC() {}

        ATC.getAtc = function (source) {
          var url = new URL("/api/v1/atc?source=" + source, NXApi.url);
          return _get(url);
        };

        return ATC;
      }();

      exports.ATC = ATC;

      var GitVersions =
      /** @class */
      function () {
        function GitVersions() {}

        GitVersions.getNewestCommit = function (user, repo, branch) {
          if (!user || !repo || !branch) {
            throw new Error("Missing argument");
          }

          return _get(new URL("/api/v1/git-versions/" + user + "/" + repo + "/branches/" + branch, NXApi.url)).then(function (res) {
            return __assign(__assign({}, res), {
              timestamp: new Date(res.timestamp)
            });
          });
        };

        GitVersions.getReleases = function (user, repo, includePreReleases) {
          if (!user || !repo) {
            throw new Error("Missing argument");
          }

          return _get(new URL("/api/v1/git-versions/" + user + "/" + repo + "/releases?" + (includePreReleases === true), NXApi.url)).then(function (res) {
            return res.map(function (rel) {
              return __assign(__assign({}, rel), {
                publishedAt: new Date(rel.publishedAt)
              });
            });
          });
        };

        GitVersions.getPulls = function (user, repo) {
          if (!user || !repo) {
            throw new Error("Missing argument");
          }

          return _get(new URL("/api/v1/git-versions/" + user + "/" + repo + "/pulls", NXApi.url));
        };

        GitVersions.getArtifact = function (user, repo, pull) {
          if (!user || !repo || !pull) {
            throw new Error("Missing argument");
          }

          return _get(new URL("/api/v1/git-versions/" + user + "/" + repo + "/pulls/" + pull + "/artifact", NXApi.url));
        };

        return GitVersions;
      }();

      exports.GitVersions = GitVersions;

      var Charts =
      /** @class */
      function () {
        function Charts() {}

        Charts.get = function (icao, source) {
          if (!icao) {
            throw new Error("No ICAO provided");
          }

          var url = new URL("/api/v1/charts/" + icao, NXApi.url);
          return _get(url);
        };

        return Charts;
      }();

      exports.Charts = Charts;
    });

    //  Copyright (c) 2021 FlyByWire Simulations
    /**
     * Defines the general freetext message format
     */

    class FreetextMessage extends AtsuMessage {
      constructor() {
        super();
        this.Type = exports.AtsuMessageType.Freetext;
        this.Direction = exports.AtsuMessageDirection.Output;
      }

      serialize(format) {
        let message = '';

        if (format === exports.AtsuMessageSerializationFormat.MCDU) {
          wordWrap(this.Message, 25).forEach(line => {
            message += "{green}".concat(line, "{end}\n");
          });
          message += '{white}------------------------{end}\n';
        } else {
          message = this.Message;
        }

        return message;
      }

    }

    /**
     * Defines the connector to the hoppies network
     */

    class HoppieConnector {
      static async connect(flightNo) {
        if (SimVar.GetSimVarValue('L:A32NX_HOPPIE_ACTIVE', 'number') !== 1) {
          HoppieConnector.flightNumber = flightNo;
          return exports.AtsuStatusCodes.NoHoppieConnection;
        }

        return HoppieConnector.isCallsignInUse(flightNo).then(code => {
          if (code === exports.AtsuStatusCodes.Ok) {
            HoppieConnector.flightNumber = flightNo;
            return HoppieConnector.poll().then(() => code);
          }

          return code;
        });
      }

      static disconnect() {
        HoppieConnector.flightNumber = '';
        return exports.AtsuStatusCodes.Ok;
      }

      static async isCallsignInUse(station) {
        if (SimVar.GetSimVarValue('L:A32NX_HOPPIE_ACTIVE', 'number') !== 1) {
          return exports.AtsuStatusCodes.NoHoppieConnection;
        }

        const body = {
          logon: NXDataStore.get('CONFIG_HOPPIE_USERID', ''),
          from: station,
          to: 'ALL-CALLSIGNS',
          type: 'ping',
          packet: station
        };
        const text = await lib.Hoppie.sendRequest(body).then(resp => resp.response);

        if (text === 'error {callsign already in use}') {
          return exports.AtsuStatusCodes.CallsignInUse;
        }

        if (text.includes('error')) {
          return exports.AtsuStatusCodes.ProxyError;
        }

        if (text.startsWith('ok') !== true) {
          return exports.AtsuStatusCodes.ComFailed;
        }

        return exports.AtsuStatusCodes.Ok;
      }

      static async isStationAvailable(station) {
        if (SimVar.GetSimVarValue('L:A32NX_HOPPIE_ACTIVE', 'number') !== 1) {
          return exports.AtsuStatusCodes.NoHoppieConnection;
        }

        if (station === HoppieConnector.flightNumber) {
          return exports.AtsuStatusCodes.OwnCallsign;
        }

        const body = {
          logon: NXDataStore.get('CONFIG_HOPPIE_USERID', ''),
          from: HoppieConnector.flightNumber,
          to: 'ALL-CALLSIGNS',
          type: 'ping',
          packet: station
        };
        const text = await lib.Hoppie.sendRequest(body).then(resp => resp.response);

        if (text.includes('error')) {
          return exports.AtsuStatusCodes.ProxyError;
        }

        if (text.startsWith('ok') !== true) {
          return exports.AtsuStatusCodes.ComFailed;
        }

        if (text !== "ok {".concat(station, "}")) {
          return exports.AtsuStatusCodes.NoAtc;
        }

        return exports.AtsuStatusCodes.Ok;
      }

      static async sendMessage(message, type) {
        const body = {
          logon: NXDataStore.get('CONFIG_HOPPIE_USERID', ''),
          from: HoppieConnector.flightNumber,
          to: message.Station,
          type,
          packet: message.serialize(exports.AtsuMessageSerializationFormat.Network)
        };
        const text = await lib.Hoppie.sendRequest(body).then(resp => resp.response).catch(() => 'proxy');

        if (text === 'proxy') {
          return exports.AtsuStatusCodes.ProxyError;
        }

        if (text !== 'ok') {
          return exports.AtsuStatusCodes.ComFailed;
        }

        return exports.AtsuStatusCodes.Ok;
      }

      static async sendTelexMessage(message, force) {
        if (force || SimVar.GetSimVarValue('L:A32NX_HOPPIE_ACTIVE', 'number') === 1) {
          return HoppieConnector.sendMessage(message, 'telex');
        }

        return exports.AtsuStatusCodes.NoHoppieConnection;
      }

      static async sendCpdlcMessage(message, force) {
        if (force || SimVar.GetSimVarValue('L:A32NX_HOPPIE_ACTIVE', 'number') === 1) {
          return HoppieConnector.sendMessage(message, 'cpdlc');
        }

        return exports.AtsuStatusCodes.NoHoppieConnection;
      }

      static async poll() {
        const retval = [];

        if (SimVar.GetSimVarValue('L:A32NX_HOPPIE_ACTIVE', 'number') !== 1) {
          return [exports.AtsuStatusCodes.NoHoppieConnection, retval];
        }

        const body = {
          logon: NXDataStore.get('CONFIG_HOPPIE_USERID', ''),
          from: HoppieConnector.flightNumber,
          to: HoppieConnector.flightNumber,
          type: 'poll'
        };
        const text = await lib.Hoppie.sendRequest(body).then(resp => resp.response).catch(() => 'proxy'); // proxy error during request

        if (text === 'proxy') {
          return [exports.AtsuStatusCodes.ProxyError, retval];
        } // something went wrong


        if (!text.startsWith('ok')) {
          return [exports.AtsuStatusCodes.ComFailed, retval];
        } // split up the received data into multiple messages


        let messages = text.split(/({.*?})/gm);
        messages = messages.filter(elem => elem !== 'ok' && elem !== 'ok ' && elem !== '} ' && elem !== '}' && elem !== ''); // create the messages

        messages.forEach(element => {
          // get the single entries of the message
          // example: [CALLSIGN telex, {Hello world!}]
          const entries = element.substring(1).split(/({.*?})/gm); // get all relevant information

          const metadata = entries[0].split(' ');
          const sender = metadata[0].toUpperCase();
          const type = metadata[1].toLowerCase();
          const content = entries[1].replace(/{/, '').replace(/}/, '');

          switch (type) {
            case 'telex':
              const freetext = new FreetextMessage();
              freetext.Network = exports.AtsuMessageNetwork.Hoppie;
              freetext.Station = sender;
              freetext.Direction = exports.AtsuMessageDirection.Input;
              freetext.ComStatus = exports.AtsuMessageComStatus.Received;
              freetext.Message = content.replace(/\n/i, ' ');
              retval.push(freetext);
              break;

            case 'cpdlc':
              const cpdlc = new CpdlcMessage();
              cpdlc.Station = sender;
              cpdlc.Direction = exports.AtsuMessageDirection.Input;
              cpdlc.ComStatus = exports.AtsuMessageComStatus.Received; // split up the data

              const elements = content.split('/');
              cpdlc.CurrentTransmissionId = parseInt(elements[2]);

              if (elements[3] !== '') {
                cpdlc.PreviousTransmissionId = parseInt(elements[3]);
              }

              cpdlc.RequestedResponses = stringToCpdlc(elements[4]);
              cpdlc.Message = elements[5];
              retval.push(cpdlc);
              break;
          }
        });
        return [exports.AtsuStatusCodes.Ok, retval];
      }

      static pollInterval() {
        return 5000;
      }

    }

    _defineProperty(HoppieConnector, "flightNumber", '');

    const WeatherMap = {
      FAA: 'faa',
      IVAO: 'ivao',
      MSFS: 'ms',
      NOAA: 'aviationweather',
      PILOTEDGE: 'pilotedge',
      VATSIM: 'vatsim'
    };
    /**
     * Defines the NXApi connector for the AOC system
     */

    class NXApiConnector {
      static createAircraftStatus() {
        const lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
        const long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');
        const alt = SimVar.GetSimVarValue('PLANE ALTITUDE', 'feet');
        const heading = SimVar.GetSimVarValue('PLANE HEADING DEGREES TRUE', 'degree');
        const acType = SimVar.GetSimVarValue('TITLE', 'string');
        const origin = NXDataStore.get('PLAN_ORIGIN', '');
        const destination = NXDataStore.get('PLAN_DESTINATION', '');
        const freetext = NXDataStore.get('CONFIG_ONLINE_FEATURES_STATUS', 'DISABLED') === 'ENABLED';
        return {
          location: {
            long,
            lat
          },
          trueAltitude: alt,
          heading,
          origin,
          destination,
          freetextEnabled: freetext,
          flight: NXApiConnector.flightNumber,
          aircraftType: acType
        };
      }

      static async connect(flightNo) {
        if (NXDataStore.get('CONFIG_ONLINE_FEATURES_STATUS', 'DISABLED') !== 'ENABLED') {
          return exports.AtsuStatusCodes.TelexDisabled;
        } // deactivate old connection


        await NXApiConnector.disconnect();
        NXApiConnector.flightNumber = flightNo;
        const status = NXApiConnector.createAircraftStatus();

        if (status !== undefined) {
          return lib.Telex.connect(status).then(res => {
            if (res.accessToken !== '') {
              NXApiConnector.connected = true;
              NXApiConnector.updateCounter = 0;
              return exports.AtsuStatusCodes.Ok;
            }

            return exports.AtsuStatusCodes.NoTelexConnection;
          }).catch(() => exports.AtsuStatusCodes.CallsignInUse);
        }

        return exports.AtsuStatusCodes.Ok;
      }

      static async disconnect() {
        if (NXDataStore.get('CONFIG_ONLINE_FEATURES_STATUS', 'DISABLED') !== 'ENABLED') {
          return exports.AtsuStatusCodes.TelexDisabled;
        }

        if (NXApiConnector.connected) {
          return lib.Telex.disconnect().then(() => {
            NXApiConnector.connected = false;
            NXApiConnector.flightNumber = '';
            return exports.AtsuStatusCodes.Ok;
          }).catch(() => exports.AtsuStatusCodes.ProxyError);
        }

        return exports.AtsuStatusCodes.NoTelexConnection;
      }

      static isConnected() {
        return NXApiConnector.connected;
      }

      static async sendTelexMessage(message) {
        if (NXApiConnector.connected) {
          const content = message.Message.replace('\n', ';');
          return lib.Telex.sendMessage(message.Station, content).then(() => {
            message.ComStatus = exports.AtsuMessageComStatus.Sent;
            return exports.AtsuStatusCodes.Ok;
          }).catch(() => {
            message.ComStatus = exports.AtsuMessageComStatus.Failed;
            return exports.AtsuStatusCodes.ComFailed;
          });
        }

        return exports.AtsuStatusCodes.NoTelexConnection;
      }

      static async receiveMetar(icao, message) {
        const storedMetarSrc = NXDataStore.get('CONFIG_METAR_SRC', 'MSFS');
        return lib.Metar.get(icao, WeatherMap[storedMetarSrc]).then(data => {
          let metar = data.metar;

          if (!metar || metar === undefined || metar === '') {
            metar = 'NO METAR AVAILABLE';
          }

          message.Reports.push({
            airport: icao,
            report: metar
          });
          return exports.AtsuStatusCodes.Ok;
        }).catch(() => {
          message.Reports.push({
            airport: icao,
            report: 'NO METAR AVAILABLE'
          });
          return exports.AtsuStatusCodes.Ok;
        });
      }

      static async receiveTaf(icao, message) {
        const storedTafSrc = NXDataStore.get('CONFIG_TAF_SRC', 'NOAA');
        return lib.Taf.get(icao, WeatherMap[storedTafSrc]).then(data => {
          let taf = data.taf;

          if (!taf || taf === undefined || taf === '') {
            taf = 'NO TAF AVAILABLE';
          }

          message.Reports.push({
            airport: icao,
            report: taf
          });
          return exports.AtsuStatusCodes.Ok;
        }).catch(() => {
          message.Reports.push({
            airport: icao,
            report: 'NO TAF AVAILABLE'
          });
          return exports.AtsuStatusCodes.Ok;
        });
      }

      static async receiveAtis(icao, type, message) {
        const storedAtisSrc = NXDataStore.get('CONFIG_ATIS_SRC', 'FAA');
        await lib.Atis.get(icao, WeatherMap[storedAtisSrc]).then(data => {
          let atis = undefined;

          if (type === exports.AtisType.Arrival) {
            if ('arr' in data) {
              atis = data.arr;
            } else {
              atis = data.combined;
            }
          } else if (type === exports.AtisType.Departure) {
            if ('dep' in data) {
              atis = data.dep;
            } else {
              atis = data.combined;
            }
          } else if (type === exports.AtisType.Enroute) {
            if ('combined' in data) {
              atis = data.combined;
            } else if ('arr' in data) {
              atis = data.arr;
            }
          }

          if (!atis || atis === undefined) {
            atis = 'D-ATIS NOT AVAILABLE';
          }

          message.Reports.push({
            airport: icao,
            report: atis
          });
        }).catch(() => {
          message.Reports.push({
            airport: icao,
            report: 'D-ATIS NOT AVAILABLE'
          });
        });
        return exports.AtsuStatusCodes.Ok;
      }

      static async poll() {
        const retval = [];

        if (NXApiConnector.connected) {
          if (NXApiConnector.updateCounter++ % 4 === 0) {
            const status = NXApiConnector.createAircraftStatus();

            if (status !== undefined) {
              const code = await lib.Telex.update(status).then(() => exports.AtsuStatusCodes.Ok).catch(() => exports.AtsuStatusCodes.ProxyError);

              if (code !== exports.AtsuStatusCodes.Ok) {
                return [exports.AtsuStatusCodes.ComFailed, retval];
              }
            }
          } // Fetch new messages


          lib.Telex.fetchMessages().then(data => {
            for (const msg of data) {
              const message = new FreetextMessage();
              message.Network = exports.AtsuMessageNetwork.FBW;
              message.Direction = exports.AtsuMessageDirection.Input;
              message.Station = msg.from.flight;
              message.Message = msg.message.replace(/;/i, ' ');
              retval.push(message);
            }
          }).catch(() => [exports.AtsuStatusCodes.ComFailed, retval]);
        }

        return [exports.AtsuStatusCodes.Ok, retval];
      }

      static pollInterval() {
        return 15000;
      }

    }

    _defineProperty(NXApiConnector, "flightNumber", '');

    _defineProperty(NXApiConnector, "connected", false);

    _defineProperty(NXApiConnector, "updateCounter", 0);

    NXDataStore.set('PLAN_ORIGIN', '');
    NXDataStore.set('PLAN_DESTINATION', '');

    class Datalink {
      enqueueReceivedMessages(parent, messages) {
        messages.forEach(message => {
          // ignore empty messages (happens sometimes in CPDLC with buggy ATC software)
          if (message.Message.length !== 0) {
            this.estimateTransmissionTime();
            setTimeout(() => parent.registerMessage(message), this.overallDelay);
          }
        });
      }

      constructor(parent) {
        _defineProperty(this, "overallDelay", 0);

        _defineProperty(this, "waitedTimeHoppie", 0);

        _defineProperty(this, "waitedTimeNXApi", 0);

        _defineProperty(this, "firstPollHoppie", true);

        // copy the datalink transmission time data
        switch (NXDataStore.get('CONFIG_DATALINK_TRANSMISSION_TIME', 'FAST')) {
          case 'REAL':
            SimVar.SetSimVarValue('L:A32NX_CONFIG_DATALINK_TIME', 'number', 0);
            break;

          case 'FAST':
            SimVar.SetSimVarValue('L:A32NX_CONFIG_DATALINK_TIME', 'number', 2);
            break;

          default:
            SimVar.SetSimVarValue('L:A32NX_CONFIG_DATALINK_TIME', 'number', 1);
            break;
        }

        setInterval(() => {
          // update the internal timer
          if (this.overallDelay <= 200) {
            this.overallDelay = 0;
          } else {
            this.overallDelay -= 200;
          }

          if (HoppieConnector.pollInterval() <= this.waitedTimeHoppie) {
            HoppieConnector.poll().then(retval => {
              if (retval[0] === exports.AtsuStatusCodes.Ok) {
                // delete all data in the first call (Hoppie stores old data)
                if (!this.firstPollHoppie) {
                  this.enqueueReceivedMessages(parent, retval[1]);
                }

                this.firstPollHoppie = false;
              }
            });
            this.waitedTimeHoppie = 0;
          } else {
            this.waitedTimeHoppie += 200;
          }

          if (NXApiConnector.pollInterval() <= this.waitedTimeNXApi) {
            NXApiConnector.poll().then(retval => {
              if (retval[0] === exports.AtsuStatusCodes.Ok) {
                this.enqueueReceivedMessages(parent, retval[1]);
              }
            });
            this.waitedTimeNXApi = 0;
          } else {
            this.waitedTimeNXApi += 200;
          }
        }, 200);
      }

      estimateTransmissionTime() {
        let timeout = 0;

        switch (SimVar.GetSimVarValue('L:A32NX_CONFIG_DATALINK_TIME', 'number')) {
          // realistic transmission
          case 0:
            timeout = 30;
            break;
          // fast transmission

          case 2:
            timeout = 10;
            break;
          // instant transmission

          default:
            timeout = 2;
            break;
        } // update the timeout and overall delay


        timeout += Math.floor(Math.random() * timeout * 0.5);
        timeout *= 1000;
        this.overallDelay += timeout;
      }

      async receiveWeatherData(requestMetar, icaos, index, message) {
        let retval = exports.AtsuStatusCodes.Ok;

        if (index < icaos.length) {
          if (requestMetar === true) {
            retval = await NXApiConnector.receiveMetar(icaos[index], message).then(() => this.receiveWeatherData(requestMetar, icaos, index + 1, message));
          } else {
            retval = await NXApiConnector.receiveTaf(icaos[index], message).then(() => this.receiveWeatherData(requestMetar, icaos, index + 1, message));
          }
        }

        return retval;
      }

      async receiveWeather(requestMetar, icaos) {
        this.estimateTransmissionTime();
        return new Promise((resolve, _reject) => {
          setTimeout(() => {
            let message = undefined;

            if (requestMetar === true) {
              message = new MetarMessage();
            } else {
              message = new TafMessage();
            }

            this.receiveWeatherData(requestMetar, icaos, 0, message).then(code => {
              if (code !== exports.AtsuStatusCodes.Ok) {
                resolve([exports.AtsuStatusCodes.ComFailed, undefined]);
              }

              resolve([exports.AtsuStatusCodes.Ok, message]);
            });
          }, this.overallDelay);
        });
      }

      async isStationAvailable(callsign) {
        return HoppieConnector.isStationAvailable(callsign);
      }

      async receiveAtis(icao, type) {
        this.estimateTransmissionTime();
        return new Promise((resolve, _reject) => {
          setTimeout(() => {
            const message = new AtisMessage();
            NXApiConnector.receiveAtis(icao, type, message).then(() => resolve([exports.AtsuStatusCodes.Ok, message]));
          }, this.overallDelay);
        });
      }

      async sendMessage(message, force) {
        this.estimateTransmissionTime();
        return new Promise((resolve, _reject) => {
          setTimeout(() => {
            if (message.Type < exports.AtsuMessageType.AOC) {
              if (message.Network === exports.AtsuMessageNetwork.FBW) {
                NXApiConnector.sendTelexMessage(message).then(code => resolve(code));
              } else {
                HoppieConnector.sendTelexMessage(message, force).then(code => resolve(code));
              }
            } else if (message.Type < exports.AtsuMessageType.ATC) {
              HoppieConnector.sendCpdlcMessage(message, force).then(code => resolve(code));
            } else {
              resolve(exports.AtsuStatusCodes.UnknownMessage);
            }
          }, this.overallDelay);
        });
      }

    }

    class AtcSystem {
      constructor(parent, datalink) {
        _defineProperty(this, "parent", undefined);

        _defineProperty(this, "datalink", undefined);

        _defineProperty(this, "listener", RegisterViewListener('JS_LISTENER_SIMVARS'));

        _defineProperty(this, "cdplcResetRequired", false);

        _defineProperty(this, "currentAtc", '');

        _defineProperty(this, "nextAtc", '');

        _defineProperty(this, "notificationTime", 0);

        _defineProperty(this, "cpdlcMessageId", 0);

        _defineProperty(this, "messageQueue", []);

        _defineProperty(this, "dcduBufferedMessages", []);

        _defineProperty(this, "unreadMessagesLastCycle", 0);

        _defineProperty(this, "lastRingTime", 0);

        this.parent = parent;
        this.datalink = datalink; // initialize the variables for the DCDU communication

        SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_DELETE_UID', 'number', -1);
        SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_ANSWER', 'number', -1);
        SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_SEND_UID', 'number', -1);
        SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_PRINT_UID', 'number', -1);
        setInterval(() => {
          const cpdlcOnline = SimVar.GetSimVarValue('L:A32NX_HOPPIE_ACTIVE', 'number') === 1;

          if (this.cdplcResetRequired && !cpdlcOnline) {
            if (this.currentAtc !== '') {
              this.logoff();
            }

            if (this.nextAtc !== '') {
              this.resetLogon();
            }

            this.listener.triggerToAllSubscribers('A32NX_DCDU_RESET');
            this.cdplcResetRequired = false;
          } else if (cpdlcOnline) {
            this.cdplcResetRequired = true;
            this.handleDcduMessageSync();
            this.handlePilotNotifications(); // check if we have to timeout the logon request

            if (this.logonInProgress()) {
              const currentTime = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
              const delta = currentTime - this.notificationTime;

              if (delta >= 300) {
                this.resetLogon();
              }
            }
          }
        }, 100);
      }

      handleDcduMessageSync() {
        if (SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_DELETE_UID', 'number') !== -1) {
          this.removeMessage(SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_DELETE_UID', 'number'));
          SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_DELETE_UID', 'number', -1);
        }

        if (SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_SEND_UID', 'number') !== -1 && SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_ANSWER', 'number') !== -1) {
          this.sendResponse(SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_SEND_UID', 'number'), SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_ANSWER', 'number'));
          SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_ANSWER', 'number', -1);
          SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_SEND_UID', 'number', -1);
        }

        if (SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_PRINT_UID', 'number') !== -1) {
          const message = this.parent.findMessage(SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_PRINT_UID', 'number'));

          if (message !== undefined) {
            this.parent.printMessage(message);
          }

          SimVar.SetSimVarValue('L:A32NX_DCDU_MSG_PRINT_UID', 'number', -1);
        }

        if (SimVar.GetSimVarValue('L:A32NX_DCDU_ATC_MSG_ACK', 'number') === 1) {
          SimVar.SetSimVarValue('L:A32NX_DCDU_ATC_MSG_WAITING', 'boolean', 0);
          SimVar.SetSimVarValue('L:A32NX_DCDU_ATC_MSG_ACK', 'number', 0);
        } // check if the buffer of the DCDU is available


        if (SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_MAX_REACHED', 'boolean') === 0) {
          while (this.dcduBufferedMessages.length !== 0) {
            if (SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_MAX_REACHED', 'boolean') !== 0) {
              break;
            }

            const uid = this.dcduBufferedMessages.shift();
            const message = this.messageQueue.find(element => element.UniqueMessageID === uid);

            if (message !== undefined) {
              this.listener.triggerToAllSubscribers('A32NX_DCDU_MSG', message);
            }
          }
        }
      }

      handlePilotNotifications() {
        const unreadMessages = SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_UNREAD_MSGS', 'number');

        if (unreadMessages !== 0) {
          const currentTime = new Date().getTime();
          let callRing = false;

          if (this.unreadMessagesLastCycle < unreadMessages) {
            this.lastRingTime = 0;
            callRing = true;
          } else {
            const delta = Math.round(Math.abs((currentTime - this.lastRingTime) / 1000));

            if (delta >= 10) {
              this.lastRingTime = currentTime;
              callRing = SimVar.GetSimVarValue('L:A32NX_DCDU_ATC_MSG_WAITING', 'boolean') === 1;
            }
          }

          if (callRing) {
            SimVar.SetSimVarValue('L:A32NX_DCDU_ATC_MSG_WAITING', 'boolean', 1);
            Coherent.call('PLAY_INSTRUMENT_SOUND', 'cpdlc_ring');
            this.lastRingTime = currentTime; // ensure that the timeout is longer than the sound

            setTimeout(() => SimVar.SetSimVarValue('W:cpdlc_ring', 'boolean', 0), 2000);
          }
        } else {
          SimVar.SetSimVarValue('L:A32NX_DCDU_ATC_MSG_WAITING', 'boolean', 0);
        }

        this.unreadMessagesLastCycle = unreadMessages;
      }

      async connect(flightNo) {
        if (this.currentAtc !== '') {
          return this.logoff().then(() => HoppieConnector.connect(flightNo));
        }

        return HoppieConnector.connect(flightNo);
      }

      async disconnect() {
        return HoppieConnector.disconnect();
      }

      currentStation() {
        return this.currentAtc;
      }

      nextStation() {
        return this.nextAtc;
      }

      nextStationNotificationTime() {
        return this.notificationTime;
      }

      logonInProgress() {
        return this.nextAtc !== '';
      }

      resetLogon() {
        this.currentAtc = '';
        this.nextAtc = '';
        this.notificationTime = 0;
        this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', '');
      }

      async logon(station) {
        if (this.nextAtc !== '' && station !== this.nextAtc) {
          return exports.AtsuStatusCodes.SystemBusy;
        }

        if (this.currentAtc !== '') {
          const retval = await this.logoff();

          if (retval !== exports.AtsuStatusCodes.Ok) {
            return retval;
          }
        }

        const message = new CpdlcMessage();
        message.Station = station;
        message.CurrentTransmissionId = ++this.cpdlcMessageId;
        message.Direction = exports.AtsuMessageDirection.Output;
        message.RequestedResponses = CpdlcMessageRequestedResponseType.Yes;
        message.ComStatus = exports.AtsuMessageComStatus.Sending;
        message.Message = 'REQUEST LOGON';
        this.nextAtc = station;
        this.parent.registerMessage(message);
        this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', "NEXT ATC: ".concat(station));
        this.notificationTime = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
        return this.datalink.sendMessage(message, false);
      }

      async logoffWithoutReset() {
        if (this.currentAtc === '') {
          return exports.AtsuStatusCodes.NoAtc;
        }

        const message = new CpdlcMessage();
        message.Station = this.currentAtc;
        message.CurrentTransmissionId = ++this.cpdlcMessageId;
        message.Direction = exports.AtsuMessageDirection.Output;
        message.RequestedResponses = CpdlcMessageRequestedResponseType.No;
        message.ComStatus = exports.AtsuMessageComStatus.Sending;
        message.Message = 'LOGOFF';
        this.parent.registerMessage(message);
        return this.datalink.sendMessage(message, true).then(error => error);
      }

      async logoff() {
        return this.logoffWithoutReset().then(error => {
          this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', '');
          this.currentAtc = '';
          this.nextAtc = '';
          return error;
        });
      }

      createCpdlcResponse(request) {
        // create the meta information of the response
        const response = new CpdlcMessage();
        response.Direction = exports.AtsuMessageDirection.Output;
        response.CurrentTransmissionId = ++this.cpdlcMessageId;
        response.PreviousTransmissionId = request.CurrentTransmissionId;
        response.RequestedResponses = CpdlcMessageRequestedResponseType.No;
        response.Station = request.Station; // create the answer text

        switch (request.ResponseType) {
          case exports.CpdlcMessageResponse.Acknowledge:
            response.Message = 'ACKNOWLEDGE';
            break;

          case exports.CpdlcMessageResponse.Affirm:
            response.Message = 'AFFIRM';
            break;

          case exports.CpdlcMessageResponse.Negative:
            response.Message = 'NEGATIVE';
            break;

          case exports.CpdlcMessageResponse.Refuse:
            response.Message = 'REFUSE';
            break;

          case exports.CpdlcMessageResponse.Roger:
            response.Message = 'ROGER';
            break;

          case exports.CpdlcMessageResponse.Standby:
            response.Message = 'STANDBY';
            break;

          case exports.CpdlcMessageResponse.Unable:
            response.Message = 'UNABLE';
            break;

          case exports.CpdlcMessageResponse.Wilco:
            response.Message = 'WILCO';
            break;

          default:
            return undefined;
        }

        return response;
      }

      sendResponse(uid, response) {
        const message = this.messageQueue.find(element => element.UniqueMessageID === uid);

        if (message !== undefined) {
          message.ResponseType = response;
          message.Response = this.createCpdlcResponse(message);
          message.Response.ComStatus = exports.AtsuMessageComStatus.Sending;
          this.listener.triggerToAllSubscribers('A32NX_DCDU_MSG', message);

          if (message.Response !== undefined) {
            this.datalink.sendMessage(message.Response, false).then(code => {
              if (code === exports.AtsuStatusCodes.Ok) {
                message.Response.ComStatus = exports.AtsuMessageComStatus.Sent;
              } else {
                message.Response.ComStatus = exports.AtsuMessageComStatus.Failed;
              }

              this.listener.triggerToAllSubscribers('A32NX_DCDU_MSG', message);
            });
          }
        }
      }

      messages() {
        return this.messageQueue;
      }

      static isRelevantMessage(message) {
        return message.Type > exports.AtsuMessageType.AOC && message.Type < exports.AtsuMessageType.ATC;
      }

      removeMessage(uid) {
        const index = this.messageQueue.findIndex(element => element.UniqueMessageID === uid);

        if (index !== -1) {
          this.listener.triggerToAllSubscribers('A32NX_DCDU_MSG_DELETE_UID', uid);
          this.messageQueue.splice(index, 1);
        }

        return index !== -1;
      }

      cleanupMessages() {
        this.messageQueue.forEach(message => this.listener.triggerToAllSubscribers('A32NX_DCDU_MSG_DELETE_UID', message.UniqueMessageID));
        this.messageQueue = [];
      }

      analyzeMessage(request, response) {
        // inserted a sent message for a new thread
        if (request.Direction === exports.AtsuMessageDirection.Output && response === undefined) {
          return true;
        }

        if (request.RequestedResponses === CpdlcMessageRequestedResponseType.NotRequired && response === undefined) {
          // received the station message for the DCDU
          if (request.Message.includes('CURRENT ATC')) {
            this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', request.Message);
            return true;
          } // received a logoff message


          if (request.Message.includes('LOGOFF')) {
            this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', '');
            this.currentAtc = '';
            return true;
          } // received a service terminated message


          if (request.Message.includes('TERMINATED')) {
            this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', '');
            this.currentAtc = '';
            return true;
          } // process the handover message


          if (request.Message.includes('HANDOVER')) {
            const entries = request.Message.split(' ');

            if (entries.length >= 2) {
              const station = entries[1].replace(/@/gi, '');
              this.logon(station);
              return true;
            }
          }
        } // expecting a LOGON or denied message


        if (this.nextAtc !== '' && request !== undefined && response !== undefined) {
          if (request.Message.startsWith('REQUEST')) {
            // logon accepted by ATC
            if (response.Message.includes('LOGON ACCEPTED')) {
              this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', "CURRENT ATC UNIT @".concat(this.nextAtc, "@"));
              this.currentAtc = this.nextAtc;
              this.nextAtc = '';
              return true;
            } // logon rejected


            if (response.Message.includes('UNABLE')) {
              this.listener.triggerToAllSubscribers('A32NX_DCDU_ATC_LOGON_MSG', '');
              this.currentAtc = '';
              this.nextAtc = '';
              return true;
            }
          }
        } // TODO later analyze requests by ATC


        return false;
      }

      insertMessage(message) {
        const cpdlcMessage = message;
        let analyzed = false; // search corresponding request, if previous ID is set

        if (cpdlcMessage.PreviousTransmissionId !== -1) {
          this.messageQueue.forEach(element => {
            // ensure that the sending and receiving stations are the same to avoid CPDLC ID overlaps
            if (element.Station === cpdlcMessage.Station) {
              while (element !== undefined) {
                if (element.CurrentTransmissionId === cpdlcMessage.PreviousTransmissionId) {
                  if (element.ResponseType === undefined) {
                    element.ResponseType = exports.CpdlcMessageResponse.Other;
                  }

                  element.Response = cpdlcMessage;
                  analyzed = this.analyzeMessage(element, cpdlcMessage);
                  break;
                }

                element = element.Response;
              }
            }
          });
        } else {
          this.messageQueue.unshift(cpdlcMessage);
          analyzed = this.analyzeMessage(cpdlcMessage, undefined);
        }

        if (!analyzed) {
          const dcduRelevant = cpdlcMessage.ComStatus === exports.AtsuMessageComStatus.Open || cpdlcMessage.ComStatus === exports.AtsuMessageComStatus.Received;

          if (dcduRelevant && SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_MAX_REACHED', 'boolean') === 0) {
            this.listener.triggerToAllSubscribers('A32NX_DCDU_MSG', message);
          } else if (dcduRelevant) {
            this.dcduBufferedMessages.push(message.UniqueMessageID);
          }
        }
      }

      messageRead(uid) {
        const index = this.messageQueue.findIndex(element => element.UniqueMessageID === uid);

        if (index !== -1 && this.messageQueue[index].Direction === exports.AtsuMessageDirection.Input) {
          this.messageQueue[index].Confirmed = true;
        }

        return index !== -1;
      }

      async sendMessage(message) {
        if (message.Station === '') {
          if (this.currentAtc === '') {
            return exports.AtsuStatusCodes.NoAtc;
          }

          message.Station = this.currentAtc;
        }

        message.ComStatus = exports.AtsuMessageComStatus.Sending;
        return this.datalink.sendMessage(message, false).then(retval => {
          if (retval === exports.AtsuStatusCodes.Ok) {
            message.ComStatus = exports.AtsuMessageComStatus.Sent;
          } else {
            message.ComStatus = exports.AtsuMessageComStatus.Failed;
          }

          return retval;
        });
      }

    }

    /**
     * Defines the AOC manager
     */
    class AocSystem {
      constructor(datalink) {
        _defineProperty(this, "datalink", undefined);

        _defineProperty(this, "messageQueue", []);

        this.datalink = datalink;
      }

      static async connect(flightNo) {
        return NXApiConnector.connect(flightNo);
      }

      static async disconnect() {
        return NXApiConnector.disconnect();
      }

      static isRelevantMessage(message) {
        return message.Type < exports.AtsuMessageType.AOC;
      }

      async sendMessage(message) {
        if (AocSystem.isRelevantMessage(message)) {
          return this.datalink.sendMessage(message, false);
        }

        return exports.AtsuStatusCodes.UnknownMessage;
      }

      removeMessage(uid) {
        const index = this.messageQueue.findIndex(element => element.UniqueMessageID === uid);

        if (index !== -1) {
          this.messageQueue.splice(index, 1);
        }

        return index !== -1;
      }

      async receiveWeather(requestMetar, icaos) {
        return this.datalink.receiveWeather(requestMetar, icaos);
      }

      async receiveAtis(icao, type) {
        return this.datalink.receiveAtis(icao, type);
      }

      messageRead(uid) {
        const index = this.messageQueue.findIndex(element => element.UniqueMessageID === uid);

        if (index !== -1 && this.messageQueue[index].Direction === exports.AtsuMessageDirection.Input) {
          if (this.messageQueue[index].Confirmed === false) {
            const cMsgCnt = SimVar.GetSimVarValue('L:A32NX_COMPANY_MSG_COUNT', 'Number');
            SimVar.SetSimVarValue('L:A32NX_COMPANY_MSG_COUNT', 'Number', cMsgCnt <= 1 ? 0 : cMsgCnt - 1);
          }

          this.messageQueue[index].Confirmed = true;
        }

        return index !== -1;
      }

      messages() {
        return this.messageQueue;
      }

      outputMessages() {
        return this.messageQueue.filter(entry => entry.Direction === exports.AtsuMessageDirection.Output);
      }

      inputMessages() {
        return this.messageQueue.filter(entry => entry.Direction === exports.AtsuMessageDirection.Input);
      }

      uidRegistered(uid) {
        return this.messageQueue.findIndex(element => uid === element.UniqueMessageID) !== -1;
      }

      insertMessage(message) {
        this.messageQueue.unshift(message);

        if (message.Direction === exports.AtsuMessageDirection.Input) {
          // increase the company message counter
          const cMsgCnt = SimVar.GetSimVarValue('L:A32NX_COMPANY_MSG_COUNT', 'Number');
          SimVar.SetSimVarValue('L:A32NX_COMPANY_MSG_COUNT', 'Number', cMsgCnt + 1);
        }
      }

    }

    /**
     * Defines the ATSU manager
     */

    class AtsuManager {
      constructor(mcdu) {
        _defineProperty(this, "datalink", new Datalink(this));

        _defineProperty(this, "fltNo", '');

        _defineProperty(this, "messageCounter", 0);

        _defineProperty(this, "aoc", new AocSystem(this.datalink));

        _defineProperty(this, "atc", new AtcSystem(this, this.datalink));

        _defineProperty(this, "listener", RegisterViewListener('JS_LISTENER_SIMVARS'));

        _defineProperty(this, "mcdu", undefined);

        this.mcdu = mcdu;
      }

      async connectToNetworks(flightNo) {
        if (flightNo.length === 0) {
          return exports.AtsuStatusCodes.Ok;
        }

        let retvalAoc = await AocSystem.connect(flightNo);

        if (retvalAoc === exports.AtsuStatusCodes.Ok || retvalAoc === exports.AtsuStatusCodes.TelexDisabled) {
          retvalAoc = exports.AtsuStatusCodes.Ok;
        }

        let retvalAtc = exports.AtsuStatusCodes.Ok;

        if (retvalAoc === exports.AtsuStatusCodes.Ok) {
          retvalAtc = await this.atc.connect(flightNo);

          if (retvalAtc === exports.AtsuStatusCodes.Ok || retvalAtc === exports.AtsuStatusCodes.NoHoppieConnection) {
            retvalAtc = exports.AtsuStatusCodes.Ok;
          } else {
            AocSystem.disconnect();
          }
        }

        if (retvalAoc === exports.AtsuStatusCodes.Ok && retvalAtc === exports.AtsuStatusCodes.Ok) {
          console.log("ATSU: Callsign switch from ".concat(this.fltNo, " to ").concat(flightNo));
          this.fltNo = flightNo;
        }

        if (retvalAoc !== exports.AtsuStatusCodes.Ok) {
          return retvalAoc;
        }

        return retvalAtc;
      }

      async disconnectFromNetworks() {
        let retvalAoc = await AocSystem.disconnect();

        if (retvalAoc === exports.AtsuStatusCodes.Ok || retvalAoc === exports.AtsuStatusCodes.NoTelexConnection) {
          retvalAoc = exports.AtsuStatusCodes.Ok;
        }

        let retvalAtc = await this.atc.disconnect();

        if (retvalAtc === exports.AtsuStatusCodes.Ok || retvalAtc === exports.AtsuStatusCodes.NoHoppieConnection) {
          retvalAtc = exports.AtsuStatusCodes.Ok;
        }

        if (retvalAoc === exports.AtsuStatusCodes.Ok && retvalAtc === exports.AtsuStatusCodes.Ok) {
          console.log('ATSU: Reset of callsign');
          this.fltNo = '';
        }

        if (retvalAoc !== exports.AtsuStatusCodes.Ok) {
          return retvalAoc;
        }

        return retvalAtc;
      }

      flightNumber() {
        return this.fltNo;
      }

      async sendMessage(message) {
        let retval = exports.AtsuStatusCodes.UnknownMessage;

        if (AocSystem.isRelevantMessage(message)) {
          retval = await this.aoc.sendMessage(message);

          if (retval === exports.AtsuStatusCodes.Ok) {
            this.registerMessage(message);
          }
        } else if (AtcSystem.isRelevantMessage(message)) {
          retval = await this.atc.sendMessage(message);

          if (retval === exports.AtsuStatusCodes.Ok) {
            this.registerMessage(message);
          }
        }

        return retval;
      }

      removeMessage(uid) {
        if (this.atc.removeMessage(uid) === true) {
          this.listener.triggerToAllSubscribers('A32NX_DCDU_MSG_DELETE_UID', uid);
        } else {
          this.aoc.removeMessage(uid);
        }
      }

      registerMessage(message) {
        message.UniqueMessageID = ++this.messageCounter;
        message.Timestamp = new AtsuTimestamp();

        if (AocSystem.isRelevantMessage(message)) {
          this.aoc.insertMessage(message);
        } else if (AtcSystem.isRelevantMessage(message)) {
          if (message.ComStatus !== exports.AtsuMessageComStatus.Sending && message.ComStatus !== exports.AtsuMessageComStatus.Sent) {
            if (SimVar.GetSimVarValue('L:A32NX_DCDU_MSG_MAX_REACHED', 'boolean') === 1) {
              this.mcdu.addNewAtsuMessage(exports.AtsuStatusCodes.DcduFull);
            }
          }

          this.atc.insertMessage(message);
        }
      }

      messageRead(uid) {
        this.aoc.messageRead(uid);
        this.atc.messageRead(uid);
      }

      async isRemoteStationAvailable(callsign) {
        return this.datalink.isStationAvailable(callsign);
      }

      findMessage(uid) {
        let message = this.aoc.messages().find(element => element.UniqueMessageID === uid);

        if (message !== undefined) {
          return message;
        }

        message = this.atc.messages().find(element => element.UniqueMessageID === uid);

        if (message !== undefined) {
          return message;
        }

        return undefined;
      }

      printMessage(message) {
        const text = message.serialize(exports.AtsuMessageSerializationFormat.Printer);
        this.mcdu.printPage(text.split('\n'));
      }

    }

    /**
     * Defines the general PDC message format
     */

    class PdcMessage extends AtsuMessage {
      constructor() {
        super();

        _defineProperty(this, "Callsign", '');

        _defineProperty(this, "Origin", '');

        _defineProperty(this, "Destination", '');

        _defineProperty(this, "Atis", '');

        _defineProperty(this, "Gate", '');

        _defineProperty(this, "Freetext0", '');

        _defineProperty(this, "Freetext1", '');

        _defineProperty(this, "Freetext2", '');

        _defineProperty(this, "Freetext3", '');

        _defineProperty(this, "Freetext4", '');

        _defineProperty(this, "Freetext5", '');

        this.Type = exports.AtsuMessageType.PDC;
        this.Direction = exports.AtsuMessageDirection.Output;
        this.Network = exports.AtsuMessageNetwork.Hoppie;
      }

      serialize(format) {
        // create the generic PDC message
        let pdcMessage = 'REQUEST PREDEP CLEARANCE\n';
        pdcMessage += "".concat(this.Callsign, " A20N TO ").concat(this.Destination, "\n");
        pdcMessage += "AT ".concat(this.Origin);

        if (this.Gate.length !== 0) {
          pdcMessage += " STAND ".concat(this.Gate);
        }

        pdcMessage += "\nATIS ".concat(this.Atis); // add the additional text, but remove empty lines
        // it is guaranteed by the UI of the DEPART REQUEST pages that empty lines exist between two filled lines

        let freetext = "".concat(this.Freetext0, "\n").concat(this.Freetext1, "\n");
        freetext += "".concat(this.Freetext2, "\n").concat(this.Freetext3, "\n");
        freetext += "".concat(this.Freetext4, "\n").concat(this.Freetext5);
        freetext = freetext.replace(/^\s*\n/gm, '');

        if (freetext.length !== 0) {
          pdcMessage += "\n".concat(freetext);
        }

        if (format === exports.AtsuMessageSerializationFormat.Network) {
          pdcMessage = pdcMessage.replace(/\n/, ' ');
        }

        return pdcMessage;
      } // used to deserialize event data


      deserialize(jsonData) {
        super.deserialize(jsonData);
        this.Callsign = jsonData.Callsign;
        this.Origin = jsonData.Origin;
        this.Destination = jsonData.Destination;
        this.Gate = jsonData.Gate;
        this.Atis = jsonData.Atis;
        this.Freetext0 = jsonData.Freetext0;
        this.Freetext1 = jsonData.Freetext1;
        this.Freetext2 = jsonData.Freetext2;
        this.Freetext3 = jsonData.Freetext3;
        this.Freetext4 = jsonData.Freetext4;
        this.Freetext5 = jsonData.Freetext5;
      }

    }

    exports.AocSystem = AocSystem;
    exports.AtcSystem = AtcSystem;
    exports.AtisMessage = AtisMessage;
    exports.AtsuManager = AtsuManager;
    exports.AtsuMessage = AtsuMessage;
    exports.AtsuTimestamp = AtsuTimestamp;
    exports.CpdlcMessage = CpdlcMessage;
    exports.FreetextMessage = FreetextMessage;
    exports.MetarMessage = MetarMessage;
    exports.PdcMessage = PdcMessage;
    exports.TafMessage = TafMessage;
    exports.WeatherMessage = WeatherMessage;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
