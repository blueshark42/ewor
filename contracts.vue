<template>
    <q-page class="flex row">
        <div class="row">
            <TableDisplay :key="tableKey" :rows="rows" :columns="cols" @selectedRow="zmluvaClicked"
                style="width: 13rem; height: 90vh" ref="contractsTableRef">
            </TableDisplay>
        </div>

        <div class="q-pa-md col-9 bg-white">
            <div class="q-ma-sm q-mb-lg">
                <q-btn-toggle v-model="contractType" size="lg" toggle-color="primary" :options="[
                    { label: t('Contracts.pawn'), value: 'pawn' },
                    { label: t('Contracts.sell'), value: 'sell' },
                ]" />
            </div>

            <q-form class="q-gutter-md">
                <q-input ref="inputID" filled v-model.number="ID" :label="$t('Generic.Contract.contractNumber')"
                    :readonly="areInputsReadOnly" @keydown.enter.prevent="inputIDCheckNewVal">
                    <template v-slot:append>
                        <q-icon name="search" @click="showAllContracts" />
                    </template>
                </q-input>
                <q-input ref="inputDatum" filled v-model="date" type="date" :label="$t('Generic.Contract.date')"
                    mask="DD/MM/YYYY" :readonly="areInputsReadOnly" @keydown.enter.prevent="changeFocus(inputMeno)" />
                <q-input ref="inputMeno" filled :readonly="areInputsReadOnly" v-model="name"
                    :label="$t('Generic.Client.name')" @keydown.enter.prevent="changeFocus(inputPriezvisko)" />
                <q-input ref="inputPriezvisko" filled :readonly="areInputsReadOnly" v-model="surname"
                    :label="$t('Generic.Client.lastName')" @keydown.enter.prevent="() => {
                            showCustomerAutofills();
                        }
                        ">
                    <template v-slot:append>
                        <q-icon name="search" @click="showCustomerAutofills" />
                    </template>
                </q-input>
                <q-input ref="inputCop" filled :readonly="areInputsReadOnly" v-model="govtIdNumber"
                    :label="$t('Generic.Client.govtIdNumber')" @keydown.enter.prevent="changeFocus(inputUlica)" />
                <q-input ref="inputUlica" filled :readonly="areInputsReadOnly" v-model="street"
                    :label="$t('Generic.Client.street')" @keydown.enter.prevent="changeFocus(inputObec)" />
                <q-input ref="inputObec" filled :readonly="areInputsReadOnly" v-model="city"
                    :label="$t('Generic.Client.municipality')" @keydown.enter.prevent="changeFocus(inputPsc)"
                    @blur="() => updateCityAbbreviation()">
                    <template v-slot:append>
                        <q-icon name="search" @click="showMesto" />
                    </template>
                </q-input>
                <q-input ref="inputPsc" filled :readonly="areInputsReadOnly" v-model="postalCode"
                    :label="$t('Generic.Client.postCode')" @keydown.enter.prevent="changeFocus(inputSuma)" />

                <q-input ref="inputSuma" class="q-mt-lg" filled v-model.number="price" prefix="EUR"
                    :label="$t('Generic.Financial.amount')" :readonly="true" />
                <q-input filled v-model.number="amountReturnedOrSold" :label="$t('Contracts.returnedAmountFinancial')"
                    prefix="EUR" :readonly="true" />
                <q-input filled v-model="item" :label="$t('Generic.Contract.products')" :readonly="true" />

                <div class="q-gutter-md">
                    <q-radio size="lg" :disable="areInputsReadOnly || contractType === 'sell'"
                        v-model="agreementValidityWeeks" val="6" :label="'6 ' + $t('Contracts.weeks')" />
                    <q-radio size="lg" :disable="areInputsReadOnly || contractType === 'sell'"
                        v-model="agreementValidityWeeks" val="7" :label="'7 ' + $t('Contracts.weeks')" />
                    <q-radio size="lg" :disable="areInputsReadOnly || contractType === 'sell'"
                        v-model="agreementValidityWeeks" val="8" :label="'8 ' + $t('Contracts.weeks')" />
                    <q-radio size="lg" :disable="areInputsReadOnly || contractType === 'sell'"
                        v-model="agreementValidityWeeks" val="9" :label="'9 ' + $t('Contracts.weeks')" />
                    <q-radio size="lg" :disable="areInputsReadOnly || contractType === 'sell'"
                        v-model="agreementValidityWeeks" val="10" :label="'10 ' + $t('Contracts.weeks')" />
                </div>
            </q-form>
        </div>

        <div class="col column">
            <q-btn class="btn" size="36px" color="positive" :label="$t('Generic.new')" @click="createContract" />
            <q-btn class="btn" size="36px" color="negative" :label="$t('Generic.remove')"
                @click="deleteContractConfirmation" :disable="!isMazButtonEnabled" />
            <q-btn class="btn" size="36px" color="primary" :label="$t('Contracts.incomingContract')" @click="handlePrijem"
                :disable="!isPrijemButtonEnabled" />
            <q-btn class="btn" size="36px" color="grey" :label="$t('Generic.print')" :disable="!isTlacitButtonEnabled"
                @click="print" />
        </div>

        <q-dialog v-model="showSelectContractDialog" :no-backdrop-dismiss="true" :no-esc-dismiss="true">
            <q-card style="height: 750px; min-width: 1100px; width: 1100px">
                <q-input ref="realtimeFilterRef" borderless dense debounce="300" v-model="realtimeFilter"
                    :placeholder="$t('Contracts.realtimeFilterMsg')" class="full-width q-pa-sm" autofocus
                    @keydown="onKeyRealtimeFilter">
                    <template v-slot:append>
                        <q-icon name="search" @click="activateNavigationAndSelectActualOrFirst" />
                    </template>
                    <!-- <template v-slot:prepend>
            <q-icon name="cancel" @click="() => { realtimeFilter = ''; changeFocus(realtimeFilterRef) }" />
          </template> -->
                </q-input>
                <q-table dense flat virtual-scroll wrap-cells :column-sort-order="columnsSortOrder"
                    :rows-per-page-options="[0]" v-model:pagination="pagination" :virtual-scroll-sticky-size-start="48"
                    ref="tableRef" :filter="realtimeFilter" :filter-method="filterRows" :table-colspan="columns.length"
                    class="my-sticky-virtscroll-table no-outline" tabindex="0" :rows="rows" :columns="columns" row-key="ID"
                    v-model:selected="selected" @focusin="activateNavigation" @focusout="deactivateNavigation"
                    @keydown="onKey" @row-click="selectRow">
                </q-table>

                <q-card-actions align="right">
                    <q-btn label="OK" color="primary" @click="selectContractOk" />
                    <q-btn v-if="false" :color="isFiltered ? 'green' : 'grey'" glossy :label="$t('Generic.search')"
                        @click="searchContract" :disable="!isHladatButtonEnabled" />
                    <q-btn label="Zrušiť" color="negative" @click="selectContractCancel" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="showItemIngressDialog" persistent>
            <q-card style="max-width: 70vw; min-width: 700px">
                <q-card-section>
                    <q-form class="q-pa-md">
                        <div class="q-gutter-md">
                            <div class="row">
                                <div class="col">
                                    <q-input ref="contractCisloZmluvy" filled v-model.number="newContract.contractId"
                                        :label="$t('Generic.Contract.contractNumber')" class="q-mt-md q-mr-md"
                                        :readonly="true" @keydown.enter.prevent="changeFocus(contractDatum)" />
                                </div>
                                <div class="col">
                                    <q-input ref="contractDatum" filled v-model="newContract.date"
                                        :label="$t('Generic.Contract.date')" type="date" class="q-mt-md" :readonly="true"
                                        @keydown.enter.prevent="changeFocus(contractNazovTovaru)" />
                                </div>
                            </div>
                        </div>

                        <q-input ref="contractNazovTovaru" filled v-model="newContract.item"
                            :label="$t('Generic.productName')" class="q-mt-md"
                            @keydown.enter.prevent="changeFocus(contractPocet)" />
                        <q-input ref="contractPocet" filled v-model.number="newContract.amount"
                            :label="$t('Generic.Contract.amount')" class="q-mt-md" type="number"
                            @focus="(input) => ((input?.target) as any).select()"
                            @keydown.enter.prevent="changeFocus(contractJednotka)" :disable="true" />
                        <q-input ref="contractJednotka" filled v-model="newContract.unit"
                            :label="$t('Generic.Contract.unit')" class="q-mt-md" :disable="true"
                            @focus="(input) => ((input?.target) as any).select()"
                            @keydown.enter.prevent="changeFocus(contractCena)" />
                        <q-input ref="contractCena" filled v-model.number="newContract.amountPaid"
                            :label="$t('Generic.Contract.price')" prefix="EUR" class="q-mt-md" type="number"
                            @focus="(input) => ((input?.target) as any).select()"
                            @keydown.enter.prevent="changeFocus(contractUrok)" />
                        <q-input ref="contractUrok" filled v-model.number="newContract.interest"
                            :label="$t('Generic.Financial.interest')" prefix="%" class="q-mt-md" type="number"
                            @focus="(input) => ((input?.target) as any).select()" />
                        <div class="q-pa-md">
                            <q-btn-group spread>
                                <q-btn color="primary" :label="$t('Generic.Ok')" @click="savePrijemTovaruForm" />
                                <q-btn color="negative" :label="$t('Generic.cancel')" @click="cancelIngressItemForm" />
                            </q-btn-group>
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="showSelectCityDialog">
            <q-card style="height: 680px; min-width: 400px; width: 400px">
                <div class="flex flex-center content-start" :key="cityTableKey">
                    <div class="virtual-row header" :style="`max-width: ${maxWidthMesta}px`">
                        <div class="virtual-col datum">{{ $t('Contracts.abbreviation') }}</div>
                        <div class="virtual-col obec">{{ $t('Generic.Client.municipality') }}</div>
                        <div class="virtual-col psc">{{ $t('Generic.Client.postCode') }}</div>
                    </div>
                    <q-virtual-scroll :key="cityTableKey" class="bg-white"
                        :style="`max-height:600px;max-width: ${maxWidthMesta}px`" :items="cityRows" separator
                        v-slot="{ item, index }">
                        <div @click="selectMestoClicked(item)" :key="index"
                            :class="selectedCity?.ID === item.ID ? 'virtual-row bg-green-2' : 'virtual-row'">
                            <div class="virtual-col datum">
                                {{ item.skratka }}
                            </div>
                            <div class="virtual-col obec">
                                {{ item.mesto }}
                            </div>
                            <div class="virtual-col pec">
                                {{ item.psc }}
                            </div>
                        </div>
                    </q-virtual-scroll>
                </div>

                <q-card-actions align="right">
                    <q-btn label="OK" color="primary" @click="selectMestoOk" :disable="!selectedCity?.ID" />
                    <q-btn color="green" :label="$t('Generic.add')" @click="addMestoClicked" />
                    <q-btn color="green-5" :label="$t('Generic.edit')" @click="editMestoClicked"
                        :disable="!selectedCity?.ID" />
                    <q-btn color="warning" :label="$t('Generic.delete')" @click="mestaDeleteMesto"
                        :disable="!selectedCity?.ID" />
                    <q-btn :label="$t('Generic.cancel')" color="negative" @click="selectMestoCancel" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-if="cityObj" v-model="showCitiesDialog" persistent>
            <q-card style="width: 600px; min-width: 600px">
                <q-card-section>
                    <q-form class="q-pa-md">
                        <div class="q-gutter-md">
                            <q-input filled v-model.number="cityObj.skratka" :label="$t('Contracts.abbreviation')"
                                class="q-mt-md" @focus="(input: any) => ((input?.target) as any).select()" />

                            <q-input filled v-model="cityObj.mesto" :label="$t('Contracts.cityOrMunicipality')"
                                class="q-mt-md" @focus="(input: any) => ((input?.target) as any).select()" />
                            <q-input filled v-model="cityObj.psc" label="PSČ" class="q-mt-md"
                                @focus="(input: any) => ((input?.target) as any).select()" />
                            <div class="q-pa-md">
                                <q-btn-group spread>
                                    <q-btn color="green" :label="$t('Generic.Ok')" @click="mestoAddOrUpdateOk" />
                                    <q-btn color="negative" :label="$t('Generic.cancel')" @click="mestoAddOrUpdateCancel" />
                                </q-btn-group>
                            </div>
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-if="search" v-model="showSearchDialog" persistent>
            <q-card style="width: 600px; min-width: 600px">
                <q-card-section>
                    <q-form class="q-pa-md">
                        <div class="q-gutter-md">
                            <q-input filled v-model.number="search.contractNumber"
                                :label="$t('Generic.Contract.contractNumber')" class="q-mt-md"
                                @focus="(input: any) => ((input?.target) as any).select()" />
                            <q-input filled v-model="search.name" :label="$t('Generic.Client.name')" class="q-mt-md"
                                @focus="(input: any) => ((input?.target) as any).select()" />

                            <q-input filled v-model="search.surname" :label="$t('Generic.Client.lastName')" class="q-mt-md"
                                @focus="(input: any) => ((input?.target) as any).select()" />
                            <q-input filled v-model="search.govtIdNumber" :label="$t('Generic.Client.govtIdNumber')"
                                class="q-mt-md" @focus="(input: any) => ((input?.target) as any).select()" />

                            <q-input filled v-model="search.street" :label="$t('Generic.Client.street')" class="q-mt-md"
                                @focus="(input: any) => ((input?.target) as any).select()" />
                            <q-input filled v-model="search.city" :label="$t('Generic.Client.municipality')" class="q-mt-md"
                                @focus="(input: any) => ((input?.target) as any).select()" />
                            <div class="q-pa-md">
                                <q-btn-group spread>
                                    <q-btn color="primary" label="OK" @click="searchGo" />
                                    <q-btn color="warning" label="Zrušiť filter" @click="searchClearFilter" />
                                    <q-btn color="negative" label="Zrušiť" @click="searchCancel" />
                                </q-btn-group>
                            </div>
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, Ref, computed, PropType, nextTick, onUnmounted, toRaw } from 'vue';
import { formatDate } from 'src/utils';
import {
    getContractById,
    updateContract,
    addContract,
    getCities,
    getContracts,
    addWarehouse,
    addMovement,
    deleteContract,
    getClientById,
    getSettings,
    getContractDeepById,
} from '../db/net';
import { Contract, City, Movement, Warehouse, Client, Settings, ContractDeep } from '../db/interface';

import { changeFocus } from '../utils';
import TableDisplay from '../components/TableDisplay.vue';
import { QTable, useQuasar } from 'quasar';
import { getDateFormatted, printPage, findUnitIdByName } from 'src/utils';
import { prepareZmluva } from 'src/print';
import '../css/drawerview.scss';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const $q = useQuasar();

const maxWidth = ref('1100');
const maxWidthMesta = ref('400');

const contractsTableRef: Ref<InstanceType<typeof TableDisplay> | null> = ref(null);

const realtimeFilterRef: any = ref(null);
const realtimeFilter = ref('');

const ID = ref(0);
const date = ref(getDateFormatted());
const name = ref('');
const surname = ref('');
const govtIdNumber = ref('');
const street = ref('');
const city = ref('');
const postalCode = ref('');
const price = ref('');
const amountReturnedOrSold = ref('');
const agreementValidityWeeks = ref('6');
const item = ref('');
const isFiltered = ref(false);

const cols = [
    {
        name: 'ID',
        label: 'Číslo zmluvy',
        field: 'ID',
        align: 'left',
        sortable: true,
    },
];
const selectedContractId = ref(0);
const selectedContract = ref<(Partial<Contract> & Partial<Client> & Partial<City>) | null>(null);

const selectContractSelectedContract: Ref<Contract | null> = ref(null);
const selectContractSelectedContractId = ref(0);
const selectedCity: Ref<City | null> = ref(null);

const executeScroll = (target: Contract | undefined) => {
    if (!target) return;

    const index = rows.findIndex((r) => r.id === target.id);
    if (index === -1) return;
    if (!contractsTableRef.value || contractsTableRef.value === null) return;
    contractsTableRef.value.scrollToIdx(target, index);
};
const onKeyRealtimeFilter = (evt: KeyboardEvent) => {
    if (evt.code === 'Enter' || evt.code === 'NumpadEnter') {
        activateNavigationAndSelectActualOrFirst();
        return;
    }

    if (evt.code === 'Escape') {
        realtimeFilter.value = '';
        return;
    }
};

const selectContractReplaceCustomer = async () => {
    if (!selectContractSelectedContract.value) {
        return;
    }
    const client: Client = await getClientById(selectContractSelectedContract.value.client_id);

    copyCustomerToForm(client);
    showSelectContractDialog.value = false;
    selectContractSelectedContract.value = null;

    clearSearch();
    changeFocus(inputCop, true);
};

const selectContractCloseDialog = () => {
    selected.value = [];
    realtimeFilter.value = '';
    selectContractSelectedContract.value = null;
    showSelectContractDialog.value = false;
  
    clearSearch();
};

const selectContractOk: Ref<() => void> = ref(selectContractReplaceCustomer);
const selectContractCancel: Ref<() => void> = ref(selectContractCloseDialog);

const props = defineProps({
    currentContract: Object as PropType<Contract | null>,
});

const tableKey = ref(0);
const cityTableKey = ref(0);
const showItemIngressDialog = ref(false);
const showSearchDialog = ref(false);
const showCitiesDialog = ref(false);
const showSelectCityDialog = ref(false);
const showSelectContractDialog = ref(false);

let rows: Contract[] = [];
let cityRows: City[] = [];
const filteredRows: Ref<Contract[]> = ref([]);

const newContract = ref({
    contractId: 0,
    date: getDateFormatted(),
    item: '',
    amount: 1,
    unit: 'ks',
    amountPaid: 0,
    interest: 4,
});

interface Search {
    contractNumber?: number;
    date?: Date;
    name?: string;
    surname?: string;
    govtIdNumber?: string;
    street?: string;
    city?: string;
}

const search: Ref<Search | null> = ref(null);
const cityObj: Ref<City | null> = ref(null);

const clearSearch = () => {
    const newSearch: Search = {
        contractNumber: 0,
        date: getDateFormatted(),
        name: '',
        surname: '',
        govtIdNumber: '',
        street: '',
        city: '',
    };
    search.value = newSearch;
};

async function handlePrijem() {
    saveValuesToDb();
    const contract: Contract | undefined = await getContractById(selectedContractId.value);

    if (!contract || contract === undefined) {
        console.error('Contract at handlePrijem() is undefined!');
        return;
    }

    newContract.value.contractId = contract.id || -1;
    newContract.value.date = contract.date;
    showItemIngressDialog.value = true;

    changeFocus(contractNazovTovaru);
}

async function savePrijemTovaruForm() {
    const unitId: number | null = await findUnitIdByName(newContract.value.unit);

    if (!unitId || unitId === null) {
        console.error('Unit ID is null!');
        return;
    }

    const valueForContract: Partial<Contract> = {
        interest: newContract.value.interest,
        item: newContract.value.item,
        price: newContract.value.amountPaid,
    };

    const valueForWarehouse: Warehouse = {
        contract_id: newContract.value.contractId,
        item_name: newContract.value.item,
        price: newContract.value.amountPaid,
        date: newContract.value.date,
        unit_id: unitId,
        quantity: newContract.value.amount,
    };

    const valueForMovement: Movement = {
        date: newContract.value.date,
        user: 'user',
        contract_id: newContract.value.contractId,
        price: newContract.value.amountPaid,
        direction: '',
        quantity: newContract.value.amount,
    };

    await updateContract(selectedContractId.value, valueForContract);
    await addWarehouse(valueForWarehouse);
    await addMovement(valueForMovement);

    const contractDeep: ContractDeep = await getContractDeepById(selectedContractId.value);

    if (contractDeep) {
        copyContractToForm(contractDeep);
        const contract: Contract = {
            id: contractDeep.id,
            date: contractDeep.date,
            amount: contractDeep.amount,
            client_id: contractDeep.client_id,
            agreement_validity_days: contractDeep.agreement_validity_days,
            interest: contractDeep.interest,
            item: contractDeep.item,
            price: contractDeep.price,
            return_sold_amount: contractDeep.return_sold_amount,
            is_returned: contractDeep.is_returned,
            is_sold: contractDeep.is_sold,
        };
        selectedContract.value = contract;
    } else {
        console.error('Contract is null!', selectedContractId.value);
    }

    cancelIngressItemForm();
}

function cancelIngressItemForm() {
    showItemIngressDialog.value = false;

    newContract.value = {
        contractId: 0,
        date: getDateFormatted(),
        item: '',
        amount: 1,
        unit: 'ks',
        amountPaid: 0,
        interest: 4,
    };
}

async function deleteDialogConfirm() {
    await deleteContract(selectedContractId.value);
    await updateTable();
}

let oldID = 0;
const inputIDCheckNewVal = async () => {
    if (oldID < 1 || oldID === ID.value) {
        return;
    }

    if (rows.findIndex((z) => z.id === ID.value) !== -1) {
        $q.dialog({
            title: t('Generic.error'),
            message: t('Contracts.contractSameExists'),
        });
        ID.value = oldID;
        changeFocus(inputDatum);
    } else {
        $q.dialog({
            title: t('Generic.confirm'),
            message: t('Contracts.areYouSureEditContract'),
            cancel: true,
            persistent: true,
        })
            .onOk(async () => {
                await updateTable();
                selectedContractId.value = ID.value;
                oldID = ID.value;
                changeFocus(inputDatum);
            })
            .onCancel(() => {
                ID.value = oldID;
                changeFocus(inputDatum);
            });
    }
};

watch(
    [name, surname, govtIdNumber, street, city, postalCode, price, amountReturnedOrSold, agreementValidityWeeks, date],
    async () => {
        await saveValuesToDb();

        const zmluva: Contract = await getContractById(selectedContractId.value);
        if (zmluva) {
            selectedContract.value = zmluva;
        } else {
            console.error('Unable to getZmluvaById', selectedContractId.value);
        }
    }
);

const zmluvaClicked = async (row: Contract) => {
    selectedContractId.value = row.ID ?? -1;
    selectedContract.value = row;

    const zmluva = await getContractById(selectedContractId.value);
    const sklad = await getSkladForZmluvaID(selectedContractId.value);

    if (!zmluva || zmluva === undefined || !zmluva.ID) {
        console.error('Zmluva is undefined.');
        return;
    }
    if (sklad && sklad.length > 0) {
        zmluva.tovary = sklad[0].tovarname;
    }

    copyContractToForm(zmluva);
};

const selectContractZmluvaClicked = async (row: Contract) => {
    selectContractSelectedContract.value = row;
    selectContractSelectedContractId.value = row.ID || 0;
};

const selectMestoClicked = (row: City) => {
    selectedCity.value = row;
};

const selectMestoOk = () => {
    if (selectedCity.value) {
        city.value = selectedCity.value.city_name;
        postalCode.value = selectedCity.value.postal_code;
    }
    showCitiesDialog.value = false;
    showSelectCityDialog.value = false;
};
