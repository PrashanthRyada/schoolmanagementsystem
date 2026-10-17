import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AttendanceInput, AttendanceRecord, ClassInput, ClassUpdate, EventInput, EventUpdate, FeeInput, FeeInvoice, FeeUpdate, GetAttendanceParams, GetFeesParams, GetStudentsParams, HealthStatus, HomepageMedia, HomepageMediaInput, HomepageMediaUpdate, PerformanceInput, PerformanceRecord, SchoolClass, SchoolEvent, SchoolOverview, Staff, Student, StudentInput, StudentUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSchoolOverviewUrl: () => string;
/**
 * @summary Get school dashboard overview
 */
export declare const getSchoolOverview: (options?: Parameters<typeof customFetch>[1]) => Promise<SchoolOverview>;
export declare const getGetSchoolOverviewQueryKey: () => readonly ["/api/school/overview"];
export declare const getGetSchoolOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getSchoolOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSchoolOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSchoolOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSchoolOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getSchoolOverview>>>;
export type GetSchoolOverviewQueryError = ErrorType<unknown>;
/**
 * @summary Get school dashboard overview
 */
export declare function useGetSchoolOverview<TData = Awaited<ReturnType<typeof getSchoolOverview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSchoolOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetStudentsUrl: (params?: GetStudentsParams) => string;
/**
 * @summary List students
 */
export declare const getStudents: (params?: GetStudentsParams, options?: Parameters<typeof customFetch>[1]) => Promise<Student[]>;
export declare const getGetStudentsQueryKey: (params?: GetStudentsParams) => readonly ["/api/students", ...GetStudentsParams[]];
export declare const getGetStudentsQueryOptions: <TData = Awaited<ReturnType<typeof getStudents>>, TError = ErrorType<unknown>>(params?: GetStudentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStudents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStudentsQueryResult = NonNullable<Awaited<ReturnType<typeof getStudents>>>;
export type GetStudentsQueryError = ErrorType<unknown>;
/**
 * @summary List students
 */
export declare function useGetStudents<TData = Awaited<ReturnType<typeof getStudents>>, TError = ErrorType<unknown>>(params?: GetStudentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateStudentUrl: () => string;
/**
 * @summary Create a student
 */
export declare const createStudent: (studentInput: StudentInput, options?: Parameters<typeof customFetch>[1]) => Promise<Student>;
export declare const getCreateStudentMutationKey: () => readonly ["createStudent"];
export declare const getCreateStudentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStudent>>, TError, CreateStudentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStudent>>, TError, CreateStudentMutationVariables, TContext>;
export type CreateStudentMutationResult = NonNullable<Awaited<ReturnType<typeof createStudent>>>;
export type CreateStudentMutationBody = BodyType<StudentInput>;
export type CreateStudentMutationError = ErrorType<unknown>;
export type CreateStudentMutationVariables = {
    data: BodyType<StudentInput>;
};
/**
* @summary Create a student
*/
export declare const useCreateStudent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStudent>>, TError, CreateStudentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStudent>>, TError, CreateStudentMutationVariables, TContext>;
export declare const getUpdateStudentUrl: (studentId: number) => string;
/**
 * @summary Update a student
 */
export declare const updateStudent: (studentId: number, studentUpdate: StudentUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Student>;
export declare const getUpdateStudentMutationKey: () => readonly ["updateStudent"];
export declare const getUpdateStudentMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStudent>>, TError, UpdateStudentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateStudent>>, TError, UpdateStudentMutationVariables, TContext>;
export type UpdateStudentMutationResult = NonNullable<Awaited<ReturnType<typeof updateStudent>>>;
export type UpdateStudentMutationBody = BodyType<StudentUpdate>;
export type UpdateStudentMutationError = ErrorType<void>;
export type UpdateStudentMutationVariables = {
    studentId: number;
    data: BodyType<StudentUpdate>;
};
/**
* @summary Update a student
*/
export declare const useUpdateStudent: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStudent>>, TError, UpdateStudentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateStudent>>, TError, UpdateStudentMutationVariables, TContext>;
export declare const getDeleteStudentUrl: (studentId: number) => string;
/**
 * @summary Delete a student
 */
export declare const deleteStudent: (studentId: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteStudentMutationKey: () => readonly ["deleteStudent"];
export declare const getDeleteStudentMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteStudent>>, TError, DeleteStudentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteStudent>>, TError, DeleteStudentMutationVariables, TContext>;
export type DeleteStudentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteStudent>>>;
export type DeleteStudentMutationError = ErrorType<void>;
export type DeleteStudentMutationVariables = {
    studentId: number;
};
/**
* @summary Delete a student
*/
export declare const useDeleteStudent: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteStudent>>, TError, DeleteStudentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteStudent>>, TError, DeleteStudentMutationVariables, TContext>;
export declare const getGetStaffUrl: () => string;
/**
 * @summary List staff
 */
export declare const getStaff: (options?: Parameters<typeof customFetch>[1]) => Promise<Staff[]>;
export declare const getGetStaffQueryKey: () => readonly ["/api/staff"];
export declare const getGetStaffQueryOptions: <TData = Awaited<ReturnType<typeof getStaff>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStaff>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStaff>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStaffQueryResult = NonNullable<Awaited<ReturnType<typeof getStaff>>>;
export type GetStaffQueryError = ErrorType<unknown>;
/**
 * @summary List staff
 */
export declare function useGetStaff<TData = Awaited<ReturnType<typeof getStaff>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStaff>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetClassesUrl: () => string;
/**
 * @summary List classes and mapped students
 */
export declare const getClasses: (options?: Parameters<typeof customFetch>[1]) => Promise<SchoolClass[]>;
export declare const getGetClassesQueryKey: () => readonly ["/api/classes"];
export declare const getGetClassesQueryOptions: <TData = Awaited<ReturnType<typeof getClasses>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getClasses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getClasses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetClassesQueryResult = NonNullable<Awaited<ReturnType<typeof getClasses>>>;
export type GetClassesQueryError = ErrorType<unknown>;
/**
 * @summary List classes and mapped students
 */
export declare function useGetClasses<TData = Awaited<ReturnType<typeof getClasses>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getClasses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateClassUrl: () => string;
/**
 * @summary Create a class
 */
export declare const createClass: (classInput: ClassInput, options?: Parameters<typeof customFetch>[1]) => Promise<SchoolClass>;
export declare const getCreateClassMutationKey: () => readonly ["createClass"];
export declare const getCreateClassMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, CreateClassMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, CreateClassMutationVariables, TContext>;
export type CreateClassMutationResult = NonNullable<Awaited<ReturnType<typeof createClass>>>;
export type CreateClassMutationBody = BodyType<ClassInput>;
export type CreateClassMutationError = ErrorType<unknown>;
export type CreateClassMutationVariables = {
    data: BodyType<ClassInput>;
};
/**
* @summary Create a class
*/
export declare const useCreateClass: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, CreateClassMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClass>>, TError, CreateClassMutationVariables, TContext>;
export declare const getUpdateClassUrl: (classId: number) => string;
/**
 * @summary Update a class and student mappings
 */
export declare const updateClass: (classId: number, classUpdate: ClassUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<SchoolClass>;
export declare const getUpdateClassMutationKey: () => readonly ["updateClass"];
export declare const getUpdateClassMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, UpdateClassMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, UpdateClassMutationVariables, TContext>;
export type UpdateClassMutationResult = NonNullable<Awaited<ReturnType<typeof updateClass>>>;
export type UpdateClassMutationBody = BodyType<ClassUpdate>;
export type UpdateClassMutationError = ErrorType<void>;
export type UpdateClassMutationVariables = {
    classId: number;
    data: BodyType<ClassUpdate>;
};
/**
* @summary Update a class and student mappings
*/
export declare const useUpdateClass: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, UpdateClassMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateClass>>, TError, UpdateClassMutationVariables, TContext>;
export declare const getDeleteClassUrl: (classId: number) => string;
/**
 * @summary Delete a class
 */
export declare const deleteClass: (classId: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteClassMutationKey: () => readonly ["deleteClass"];
export declare const getDeleteClassMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, DeleteClassMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, DeleteClassMutationVariables, TContext>;
export type DeleteClassMutationResult = NonNullable<Awaited<ReturnType<typeof deleteClass>>>;
export type DeleteClassMutationError = ErrorType<void>;
export type DeleteClassMutationVariables = {
    classId: number;
};
/**
* @summary Delete a class
*/
export declare const useDeleteClass: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, DeleteClassMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteClass>>, TError, DeleteClassMutationVariables, TContext>;
export declare const getGetAttendanceUrl: (params: GetAttendanceParams) => string;
/**
 * @summary List attendance for a date
 */
export declare const getAttendance: (params: GetAttendanceParams, options?: Parameters<typeof customFetch>[1]) => Promise<AttendanceRecord[]>;
export declare const getGetAttendanceQueryKey: (params?: GetAttendanceParams) => readonly ["/api/attendance", ...GetAttendanceParams[]];
export declare const getGetAttendanceQueryOptions: <TData = Awaited<ReturnType<typeof getAttendance>>, TError = ErrorType<unknown>>(params: GetAttendanceParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttendance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAttendance>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAttendanceQueryResult = NonNullable<Awaited<ReturnType<typeof getAttendance>>>;
export type GetAttendanceQueryError = ErrorType<unknown>;
/**
 * @summary List attendance for a date
 */
export declare function useGetAttendance<TData = Awaited<ReturnType<typeof getAttendance>>, TError = ErrorType<unknown>>(params: GetAttendanceParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttendance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkAttendanceUrl: () => string;
/**
 * @summary Mark or update attendance
 */
export declare const markAttendance: (attendanceInput: AttendanceInput, options?: Parameters<typeof customFetch>[1]) => Promise<AttendanceRecord>;
export declare const getMarkAttendanceMutationKey: () => readonly ["markAttendance"];
export declare const getMarkAttendanceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAttendance>>, TError, MarkAttendanceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAttendance>>, TError, MarkAttendanceMutationVariables, TContext>;
export type MarkAttendanceMutationResult = NonNullable<Awaited<ReturnType<typeof markAttendance>>>;
export type MarkAttendanceMutationBody = BodyType<AttendanceInput>;
export type MarkAttendanceMutationError = ErrorType<unknown>;
export type MarkAttendanceMutationVariables = {
    data: BodyType<AttendanceInput>;
};
/**
* @summary Mark or update attendance
*/
export declare const useMarkAttendance: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAttendance>>, TError, MarkAttendanceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAttendance>>, TError, MarkAttendanceMutationVariables, TContext>;
export declare const getGetFeesUrl: (params?: GetFeesParams) => string;
/**
 * @summary List fee invoices
 */
export declare const getFees: (params?: GetFeesParams, options?: Parameters<typeof customFetch>[1]) => Promise<FeeInvoice[]>;
export declare const getGetFeesQueryKey: (params?: GetFeesParams) => readonly ["/api/fees", ...GetFeesParams[]];
export declare const getGetFeesQueryOptions: <TData = Awaited<ReturnType<typeof getFees>>, TError = ErrorType<unknown>>(params?: GetFeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFees>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFeesQueryResult = NonNullable<Awaited<ReturnType<typeof getFees>>>;
export type GetFeesQueryError = ErrorType<unknown>;
/**
 * @summary List fee invoices
 */
export declare function useGetFees<TData = Awaited<ReturnType<typeof getFees>>, TError = ErrorType<unknown>>(params?: GetFeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateFeeUrl: () => string;
/**
 * @summary Create a fee invoice
 */
export declare const createFee: (feeInput: FeeInput, options?: Parameters<typeof customFetch>[1]) => Promise<FeeInvoice>;
export declare const getCreateFeeMutationKey: () => readonly ["createFee"];
export declare const getCreateFeeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFee>>, TError, CreateFeeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFee>>, TError, CreateFeeMutationVariables, TContext>;
export type CreateFeeMutationResult = NonNullable<Awaited<ReturnType<typeof createFee>>>;
export type CreateFeeMutationBody = BodyType<FeeInput>;
export type CreateFeeMutationError = ErrorType<unknown>;
export type CreateFeeMutationVariables = {
    data: BodyType<FeeInput>;
};
/**
* @summary Create a fee invoice
*/
export declare const useCreateFee: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFee>>, TError, CreateFeeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFee>>, TError, CreateFeeMutationVariables, TContext>;
export declare const getUpdateFeeUrl: (feeId: number) => string;
/**
 * @summary Update fee payment details
 */
export declare const updateFee: (feeId: number, feeUpdate: FeeUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<FeeInvoice>;
export declare const getUpdateFeeMutationKey: () => readonly ["updateFee"];
export declare const getUpdateFeeMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFee>>, TError, UpdateFeeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateFee>>, TError, UpdateFeeMutationVariables, TContext>;
export type UpdateFeeMutationResult = NonNullable<Awaited<ReturnType<typeof updateFee>>>;
export type UpdateFeeMutationBody = BodyType<FeeUpdate>;
export type UpdateFeeMutationError = ErrorType<void>;
export type UpdateFeeMutationVariables = {
    feeId: number;
    data: BodyType<FeeUpdate>;
};
/**
* @summary Update fee payment details
*/
export declare const useUpdateFee: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFee>>, TError, UpdateFeeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateFee>>, TError, UpdateFeeMutationVariables, TContext>;
export declare const getDeleteFeeUrl: (feeId: number) => string;
/**
 * @summary Delete a fee invoice
 */
export declare const deleteFee: (feeId: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteFeeMutationKey: () => readonly ["deleteFee"];
export declare const getDeleteFeeMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteFee>>, TError, DeleteFeeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteFee>>, TError, DeleteFeeMutationVariables, TContext>;
export type DeleteFeeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteFee>>>;
export type DeleteFeeMutationError = ErrorType<void>;
export type DeleteFeeMutationVariables = {
    feeId: number;
};
/**
* @summary Delete a fee invoice
*/
export declare const useDeleteFee: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteFee>>, TError, DeleteFeeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteFee>>, TError, DeleteFeeMutationVariables, TContext>;
export declare const getGetStudentPerformanceUrl: (studentId: number) => string;
/**
 * @summary Get a student's academic performance
 */
export declare const getStudentPerformance: (studentId: number, options?: Parameters<typeof customFetch>[1]) => Promise<PerformanceRecord[]>;
export declare const getGetStudentPerformanceQueryKey: (studentId: number) => readonly [`/api/students/${number}/performance`];
export declare const getGetStudentPerformanceQueryOptions: <TData = Awaited<ReturnType<typeof getStudentPerformance>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudentPerformance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStudentPerformance>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStudentPerformanceQueryResult = NonNullable<Awaited<ReturnType<typeof getStudentPerformance>>>;
export type GetStudentPerformanceQueryError = ErrorType<unknown>;
/**
 * @summary Get a student's academic performance
 */
export declare function useGetStudentPerformance<TData = Awaited<ReturnType<typeof getStudentPerformance>>, TError = ErrorType<unknown>>(studentId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStudentPerformance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAddStudentPerformanceUrl: (studentId: number) => string;
/**
 * @summary Add a performance result
 */
export declare const addStudentPerformance: (studentId: number, performanceInput: PerformanceInput, options?: Parameters<typeof customFetch>[1]) => Promise<PerformanceRecord>;
export declare const getAddStudentPerformanceMutationKey: () => readonly ["addStudentPerformance"];
export declare const getAddStudentPerformanceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addStudentPerformance>>, TError, AddStudentPerformanceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addStudentPerformance>>, TError, AddStudentPerformanceMutationVariables, TContext>;
export type AddStudentPerformanceMutationResult = NonNullable<Awaited<ReturnType<typeof addStudentPerformance>>>;
export type AddStudentPerformanceMutationBody = BodyType<PerformanceInput>;
export type AddStudentPerformanceMutationError = ErrorType<unknown>;
export type AddStudentPerformanceMutationVariables = {
    studentId: number;
    data: BodyType<PerformanceInput>;
};
/**
* @summary Add a performance result
*/
export declare const useAddStudentPerformance: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addStudentPerformance>>, TError, AddStudentPerformanceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addStudentPerformance>>, TError, AddStudentPerformanceMutationVariables, TContext>;
export declare const getGetEventsUrl: () => string;
/**
 * @summary List school events
 */
export declare const getEvents: (options?: Parameters<typeof customFetch>[1]) => Promise<SchoolEvent[]>;
export declare const getGetEventsQueryKey: () => readonly ["/api/events"];
export declare const getGetEventsQueryOptions: <TData = Awaited<ReturnType<typeof getEvents>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEvents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEventsQueryResult = NonNullable<Awaited<ReturnType<typeof getEvents>>>;
export type GetEventsQueryError = ErrorType<unknown>;
/**
 * @summary List school events
 */
export declare function useGetEvents<TData = Awaited<ReturnType<typeof getEvents>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEventUrl: () => string;
/**
 * @summary Create an event
 */
export declare const createEvent: (eventInput: EventInput, options?: Parameters<typeof customFetch>[1]) => Promise<SchoolEvent>;
export declare const getCreateEventMutationKey: () => readonly ["createEvent"];
export declare const getCreateEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvent>>, TError, CreateEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEvent>>, TError, CreateEventMutationVariables, TContext>;
export type CreateEventMutationResult = NonNullable<Awaited<ReturnType<typeof createEvent>>>;
export type CreateEventMutationBody = BodyType<EventInput>;
export type CreateEventMutationError = ErrorType<unknown>;
export type CreateEventMutationVariables = {
    data: BodyType<EventInput>;
};
/**
* @summary Create an event
*/
export declare const useCreateEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvent>>, TError, CreateEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEvent>>, TError, CreateEventMutationVariables, TContext>;
export declare const getUpdateEventUrl: (eventId: number) => string;
/**
 * @summary Update an event
 */
export declare const updateEvent: (eventId: number, eventUpdate: EventUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<SchoolEvent>;
export declare const getUpdateEventMutationKey: () => readonly ["updateEvent"];
export declare const getUpdateEventMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEvent>>, TError, UpdateEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEvent>>, TError, UpdateEventMutationVariables, TContext>;
export type UpdateEventMutationResult = NonNullable<Awaited<ReturnType<typeof updateEvent>>>;
export type UpdateEventMutationBody = BodyType<EventUpdate>;
export type UpdateEventMutationError = ErrorType<void>;
export type UpdateEventMutationVariables = {
    eventId: number;
    data: BodyType<EventUpdate>;
};
/**
* @summary Update an event
*/
export declare const useUpdateEvent: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEvent>>, TError, UpdateEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEvent>>, TError, UpdateEventMutationVariables, TContext>;
export declare const getDeleteEventUrl: (eventId: number) => string;
/**
 * @summary Delete an event
 */
export declare const deleteEvent: (eventId: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteEventMutationKey: () => readonly ["deleteEvent"];
export declare const getDeleteEventMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEvent>>, TError, DeleteEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEvent>>, TError, DeleteEventMutationVariables, TContext>;
export type DeleteEventMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEvent>>>;
export type DeleteEventMutationError = ErrorType<void>;
export type DeleteEventMutationVariables = {
    eventId: number;
};
/**
* @summary Delete an event
*/
export declare const useDeleteEvent: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEvent>>, TError, DeleteEventMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEvent>>, TError, DeleteEventMutationVariables, TContext>;
export declare const getGetHomepageMediaUrl: () => string;
/**
 * @summary List homepage carousel media
 */
export declare const getHomepageMedia: (options?: Parameters<typeof customFetch>[1]) => Promise<HomepageMedia[]>;
export declare const getGetHomepageMediaQueryKey: () => readonly ["/api/homepage-media"];
export declare const getGetHomepageMediaQueryOptions: <TData = Awaited<ReturnType<typeof getHomepageMedia>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHomepageMedia>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHomepageMedia>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHomepageMediaQueryResult = NonNullable<Awaited<ReturnType<typeof getHomepageMedia>>>;
export type GetHomepageMediaQueryError = ErrorType<unknown>;
/**
 * @summary List homepage carousel media
 */
export declare function useGetHomepageMedia<TData = Awaited<ReturnType<typeof getHomepageMedia>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHomepageMedia>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateHomepageMediaUrl: () => string;
/**
 * @summary Add homepage carousel media
 */
export declare const createHomepageMedia: (homepageMediaInput: HomepageMediaInput, options?: Parameters<typeof customFetch>[1]) => Promise<HomepageMedia>;
export declare const getCreateHomepageMediaMutationKey: () => readonly ["createHomepageMedia"];
export declare const getCreateHomepageMediaMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHomepageMedia>>, TError, CreateHomepageMediaMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createHomepageMedia>>, TError, CreateHomepageMediaMutationVariables, TContext>;
export type CreateHomepageMediaMutationResult = NonNullable<Awaited<ReturnType<typeof createHomepageMedia>>>;
export type CreateHomepageMediaMutationBody = BodyType<HomepageMediaInput>;
export type CreateHomepageMediaMutationError = ErrorType<unknown>;
export type CreateHomepageMediaMutationVariables = {
    data: BodyType<HomepageMediaInput>;
};
/**
* @summary Add homepage carousel media
*/
export declare const useCreateHomepageMedia: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHomepageMedia>>, TError, CreateHomepageMediaMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createHomepageMedia>>, TError, CreateHomepageMediaMutationVariables, TContext>;
export declare const getUpdateHomepageMediaUrl: (mediaId: number) => string;
/**
 * @summary Update homepage media
 */
export declare const updateHomepageMedia: (mediaId: number, homepageMediaUpdate: HomepageMediaUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<HomepageMedia>;
export declare const getUpdateHomepageMediaMutationKey: () => readonly ["updateHomepageMedia"];
export declare const getUpdateHomepageMediaMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateHomepageMedia>>, TError, UpdateHomepageMediaMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateHomepageMedia>>, TError, UpdateHomepageMediaMutationVariables, TContext>;
export type UpdateHomepageMediaMutationResult = NonNullable<Awaited<ReturnType<typeof updateHomepageMedia>>>;
export type UpdateHomepageMediaMutationBody = BodyType<HomepageMediaUpdate>;
export type UpdateHomepageMediaMutationError = ErrorType<void>;
export type UpdateHomepageMediaMutationVariables = {
    mediaId: number;
    data: BodyType<HomepageMediaUpdate>;
};
/**
* @summary Update homepage media
*/
export declare const useUpdateHomepageMedia: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateHomepageMedia>>, TError, UpdateHomepageMediaMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateHomepageMedia>>, TError, UpdateHomepageMediaMutationVariables, TContext>;
export declare const getDeleteHomepageMediaUrl: (mediaId: number) => string;
/**
 * @summary Delete homepage media
 */
export declare const deleteHomepageMedia: (mediaId: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteHomepageMediaMutationKey: () => readonly ["deleteHomepageMedia"];
export declare const getDeleteHomepageMediaMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHomepageMedia>>, TError, DeleteHomepageMediaMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteHomepageMedia>>, TError, DeleteHomepageMediaMutationVariables, TContext>;
export type DeleteHomepageMediaMutationResult = NonNullable<Awaited<ReturnType<typeof deleteHomepageMedia>>>;
export type DeleteHomepageMediaMutationError = ErrorType<void>;
export type DeleteHomepageMediaMutationVariables = {
    mediaId: number;
};
/**
* @summary Delete homepage media
*/
export declare const useDeleteHomepageMedia: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHomepageMedia>>, TError, DeleteHomepageMediaMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteHomepageMedia>>, TError, DeleteHomepageMediaMutationVariables, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map