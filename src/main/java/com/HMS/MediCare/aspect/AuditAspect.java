package com.HMS.MediCare.aspect;

import com.HMS.MediCare.enums.AuditAction;
import com.HMS.MediCare.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * Audit Aspect for automatic logging of service operations
 * Uses AOP to intercept service methods and log audit events
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;

    /**
     * Pointcut for all service methods
     */
    @Pointcut("execution(* com.HMS.MediCare.service.*.*(..))")
    public void serviceMethodPointcut() {}

    /**
     * Pointcut for create operations (register, create, add)
     */
    @Pointcut("execution(* com.HMS.MediCare.service.*.register(..)) || " +
              "execution(* com.HMS.MediCare.service.*.create*(..)) || " +
              "execution(* com.HMS.MediCare.service.*.add*(..))")
    public void createOperationPointcut() {}

    /**
     * Pointcut for read operations (get, find)
     */
    @Pointcut("execution(* com.HMS.MediCare.service.*.get*(..)) || " +
              "execution(* com.HMS.MediCare.service.*.find*(..))")
    public void readOperationPointcut() {}

    /**
     * Pointcut for update operations
     */
    @Pointcut("execution(* com.HMS.MediCare.service.*.update*(..))")
    public void updateOperationPointcut() {}

    /**
     * Pointcut for delete operations
     */
    @Pointcut("execution(* com.HMS.MediCare.service.*.delete*(..))")
    public void deleteOperationPointcut() {}

    /**
     * Pointcut for login operations
     */
    @Pointcut("execution(* com.HMS.MediCare.service.*.login(..)) || " +
              "execution(* com.HMS.MediCare.service.*.authenticate*(..))")
    public void loginOperationPointcut() {}

    /**
     * Log successful CREATE operations
     */
    @AfterReturning(pointcut = "createOperationPointcut()", returning = "result")
    public void logCreateOperation(JoinPoint joinPoint, Object result) {
        logOperation(joinPoint, result, AuditAction.CREATE);
    }

    /**
     * Log successful UPDATE operations
     */
    @AfterReturning(pointcut = "updateOperationPointcut()", returning = "result")
    public void logUpdateOperation(JoinPoint joinPoint, Object result) {
        logOperation(joinPoint, result, AuditAction.UPDATE);
    }

    /**
     * Log successful DELETE operations
     */
    @AfterReturning(pointcut = "deleteOperationPointcut()")
    public void logDeleteOperation(JoinPoint joinPoint) {
        String entityType = extractEntityType(joinPoint);
        String entityId = extractEntityId(joinPoint);
        String method = joinPoint.getSignature().toShortString();
        
        auditLogService.log(AuditAction.DELETE, entityType, entityId, method);
    }

    /**
     * Log successful LOGIN operations
     */
    @AfterReturning(pointcut = "loginOperationPointcut()", returning = "result")
    public void logLoginOperation(JoinPoint joinPoint, Object result) {
        String method = joinPoint.getSignature().toShortString();
        auditLogService.log(AuditAction.LOGIN, "Session", null, method);
    }

    /**
     * Log failed operations
     */
    @AfterThrowing(pointcut = "serviceMethodPointcut()", throwing = "exception")
    public void logFailedOperation(JoinPoint joinPoint, Throwable exception) {
        String entityType = extractEntityType(joinPoint);
        String method = joinPoint.getSignature().toShortString();
        String details = exception.getMessage();
        
        AuditAction action = determineAction(joinPoint);
        auditLogService.logFailure(action, entityType, method, details);
    }

    /**
     * Helper method to log operations
     */
    private void logOperation(JoinPoint joinPoint, Object result, AuditAction action) {
        String entityType = extractEntityType(joinPoint);
        String entityId = extractEntityIdFromResult(result);
        String method = joinPoint.getSignature().toShortString();
        
        auditLogService.log(action, entityType, entityId, method);
    }

    /**
     * Extract entity type from join point (service class name)
     */
    private String extractEntityType(JoinPoint joinPoint) {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        return className.replace("Service", "");
    }

    /**
     * Extract entity ID from join point arguments
     */
    private String extractEntityId(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof Long) {
            return String.valueOf(args[0]);
        }
        return null;
    }

    /**
     * Extract entity ID from result object
     */
    private String extractEntityIdFromResult(Object result) {
        if (result == null) {
            return null;
        }
        try {
            // Try to get ID using reflection
            var method = result.getClass().getMethod("getId");
            Object id = method.invoke(result);
            return id != null ? String.valueOf(id) : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Determine action type from method name
     */
    private AuditAction determineAction(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName().toLowerCase();
        
        if (methodName.contains("create") || methodName.contains("add") || methodName.contains("register")) {
            return AuditAction.CREATE;
        } else if (methodName.contains("update")) {
            return AuditAction.UPDATE;
        } else if (methodName.contains("delete")) {
            return AuditAction.DELETE;
        } else if (methodName.contains("login") || methodName.contains("authenticate")) {
            return AuditAction.LOGIN;
        } else if (methodName.contains("get") || methodName.contains("find")) {
            return AuditAction.READ;
        }
        return AuditAction.READ;
    }
}
