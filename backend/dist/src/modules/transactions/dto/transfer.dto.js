"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferDto = void 0;
const class_validator_1 = require("class-validator");
class TransferDto {
    fromAccountId;
    toAccountId;
    amount;
}
exports.TransferDto = TransferDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de la cuenta de origen debe ser un UUID válido' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferDto.prototype, "fromAccountId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de la cuenta de destino debe ser un UUID válido' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferDto.prototype, "toAccountId", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'El monto debe ser numérico válido (ej: "100.50")' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferDto.prototype, "amount", void 0);
//# sourceMappingURL=transfer.dto.js.map